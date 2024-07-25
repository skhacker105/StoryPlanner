import { Injectable } from '@angular/core';
import { TimelineService } from './timeline.service';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { MovieService } from './movie.service';
import { ServiceBase } from '../base/service-base';
import html2canvas from 'html2canvas';
import { FileService } from './file.service';
import { Video } from '../models/video';
import { IndexedDBManager } from '../storage/indexedDB.manager';
import { Tables } from '../constants/constant';

@Injectable({
  providedIn: 'root'
})
export class RecordingService extends ServiceBase {


  allVideos: Video[] = [];
  playVideo = new BehaviorSubject<Video | undefined>(undefined);
  // selectedVideoId = new BehaviorSubject<string | undefined>(undefined);
  videoStorageManager = new IndexedDBManager<Video>(Tables.VideoListStorage, 'id');

  animationPausedForCapture = new BehaviorSubject<boolean>(true);
  recording = new BehaviorSubject<boolean>(false);
  recordedFrames: HTMLCanvasElement[] = [];
  unitTimeRecordingPercent = new BehaviorSubject<number>(0);
  canvasContainerId = 'canvas-container';

  constructor(private timelineService: TimelineService, private movieService: MovieService, private fileService: FileService) {
    super();
    this.loadVideosFromStorage();

    this.fileService.newVideo
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: newVideo => this.addNewVideo(newVideo)
      })

    this.timelineService.playingStateChange
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: playing => {
          playing ? this.animationPausedForCapture.next(false) : this.animationPausedForCapture.next(true);
          playing && this.playVideo.value ? this.resetSelectedVideo() : null;
        }
      })
  }

  loadVideosFromStorage(): void {
    this.videoStorageManager.getAll()
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: videos => this.allVideos = videos
      });
  }

  addNewVideo(video: Video): void {
    this.allVideos.unshift(video);
    this.selectVideo(video);
    this.videoStorageManager.add(video);
  }

  deleteVideo(videoId: string) {
    this.videoStorageManager.delete(videoId);
    this.loadVideosFromStorage();
  }

  selectVideo(video: Video): void {
    this.playVideo.next(video);
  }

  resetSelectedVideo(): void {
    this.playVideo.next(undefined);
  }

  toggleRecording(): void {
    if (this.recording.value) this.stopRecording();
    else this.startRecording();
  }

  startRecording(): void {
    if (this.timelineService.playing) this.timelineService.pause();
    this.recordedFrames = [];
    if (this.playVideo.value) this.resetSelectedVideo();
    this.timelineService.timeToEnd();
    this.recording.next(true);
    this.timelineService.timeToZero();
    this.record();
  }

  updateFrameRecordingPercent(collectedFrames: number) {
    this.unitTimeRecordingPercent.next((collectedFrames / this.timelineService.framesPerUnitTime.value) * 100);
  }

  record(): void {
    this.timelineService.setMaxPlayTime(this.movieService.maxPlayTime);
    this.runWhileRecording([]);
  }

  async runWhileRecording(frameCanvas: HTMLCanvasElement[]) {
    if (!this.recording.value) {
      if (frameCanvas.length > 0)
        this.recordedFrames = this.recordedFrames.concat(frameCanvas);
      this.stopRecording();
      this.saveCanvasAsVideo();
      return;
    }
    this.updateFrameRecordingPercent(frameCanvas.length);

    // frames pending to capture
    if (frameCanvas.length < this.timelineService.framesPerUnitTime.value) {

      const collectedFrames = await this.captureFrame(frameCanvas);
      if (collectedFrames) {
        this.runWhileRecording(collectedFrames);

      } else this.stopRecording()

    } else { // store all collected frames and increase time
      this.recordedFrames = this.recordedFrames.concat(frameCanvas);

      if (this.timelineService.hasNextTime()) {
        this.timelineService.increaseTime();
        this.runWhileRecording([]);

      } else {
        this.stopRecording();
        this.saveCanvasAsVideo();

      }
    }
  }

  async captureFrame(frameCanvas: HTMLCanvasElement[]) {
    const canvasContainerId = this.canvasContainerId
    const divElement = document.getElementById(canvasContainerId);
    if (!divElement) {
      this.stopRecording();
      return;
    }

    const updatedCanvases = await new Promise<HTMLCanvasElement[]>((resolve, reject) => {
      setTimeout(() => {
        html2canvas(divElement)
          .then(async (canvas) => {
            frameCanvas.push(canvas);
            await this.runOneFrameOfAnimation();
            resolve(frameCanvas);
          })
          .catch(err => reject(err));
      }, 100);
    });
    return updatedCanvases;
  }

  async runOneFrameOfAnimation() {

    await this.loopTimeout(Math.floor(this.timelineService.frameSpeedByPerUnitTime / 10), this.timelineService.frameSpeedByPerUnitTime, new Date())
  }

  async loopTimeout(duration: number, remainingTime: number, lastDate: Date) {
    // const dt1 = new Date();
    this.animationPausedForCapture.next(false);
    return await new Promise(resolve => {
      setTimeout(async() => {
        const dt2 = new Date();
        const diff = dt2.getTime() - lastDate.getTime();

        const newTimeRemaining = remainingTime - diff;
        if (newTimeRemaining < 0) {
          this.animationPausedForCapture.next(true);
        } else {
          await this.loopTimeout(duration, newTimeRemaining, dt2);
        }
        resolve(null);
      }, duration);
    });
  }

  stopRecording(): void {
    if (!this.recording.value) return;

    // this.animationPausedForCapture.next(true);
    this.recording.next(false);
    this.unitTimeRecordingPercent.next(0);
    this.timelineService.resetMaxPlayTime();
  }

  saveCanvasAsVideo(): void {
    if (!this.recordedFrames || this.recordedFrames.length === 0) return;

    console.log('this.recordedFrames = ', this.recordedFrames)
    const timeLength = this.recordedFrames.length / this.timelineService.framesPerUnitTime.value;
    const videoLength = +((this.timelineService.standardSpeed.value / 1000) * timeLength).toFixed(2);
    this.fileService.saveFramesAsVideo(this.recordedFrames, this.timelineService.frameSpeedByPerUnitTime, videoLength)
  }
}
