import { Injectable } from '@angular/core';
import { TimelineService } from './timeline.service';
import { BehaviorSubject } from 'rxjs';
import { MovieService } from './movie.service';
import { ServiceBase } from '../base/service-base';
import html2canvas from 'html2canvas';
import { FileService } from './file.service';
import computedStyleToInlineStyle from 'computed-style-to-inline-style';

@Injectable({
  providedIn: 'root'
})
export class RecordingService extends ServiceBase {

  animationPausedForCapture = new BehaviorSubject<boolean>(false);
  recording = new BehaviorSubject<boolean>(false);
  recordedFrames: HTMLCanvasElement[] = [];
  canvasContainerId = 'canvas-container';

  constructor(private timelineService: TimelineService, private movieService: MovieService, private fileService: FileService) {
    super();
  }

  toggleRecording(): void {
    if (this.recording.value) this.stopRecording();
    else this.startRecording();
  }

  startRecording(): void {
    if (this.timelineService.playing) this.timelineService.pause();
    this.timelineService.timeToEnd();
    this.recording.next(true);
    this.timelineService.timeToZero();
    this.record();
  }

  record(): void {
    this.timelineService.setMaxPlayTime(this.movieService.maxPlayTime);
    this.runWhileRecording([]);
  }

  runWhileRecording(frameCanvas: HTMLCanvasElement[]): void {
    if (!this.recording.value) {
      if (frameCanvas.length > 0)
        this.recordedFrames = this.recordedFrames.concat(frameCanvas);
      this.stopRecording();
      this.saveCanvasAsVideo();
      return;
    }

    // frames pending to capture
    if (frameCanvas.length < this.timelineService.framesPerUnitTime) {
      this.captureFrame(frameCanvas);

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

  captureFrame(frameCanvas: HTMLCanvasElement[]): void {
    const divElement = document.getElementById(this.canvasContainerId);
    if (!divElement) {
      this.stopRecording();
      return;
    }
    this.animationPausedForCapture.next(true);

    setTimeout(() => {
      html2canvas(divElement, {
        // onclone: doc => {
        //   const newDivElement = document.getElementById(this.canvasContainerId);
        //   if (newDivElement)
        //     computedStyleToInlineStyle(newDivElement, { recursive: true })
        // }
      })
        .then(canvas => {
          frameCanvas.push(canvas);

          this.animationPausedForCapture.next(false);
          setTimeout(() => {
            this.runWhileRecording(frameCanvas);

          }, this.timelineService.frameSpeedByPerUnitTime);

        })
        .catch(err => {
          console.log('err = ', err)
          this.stopRecording();
        });
    }, 100);
  }

  stopRecording(): void {
    if (!this.recording.value) return;

    this.recording.next(false);
    this.timelineService.resetMaxPlayTime();
  }

  saveCanvasAsVideo(): void {
    if (!this.recordedFrames || this.recordedFrames.length === 0) return;

    const videoLength = this.recordedFrames.length / this.timelineService.framesPerUnitTime;
    this.fileService.saveFramesAsVideo(this.recordedFrames, this.timelineService.frameSpeedByPerUnitTime, videoLength)
  }
}
