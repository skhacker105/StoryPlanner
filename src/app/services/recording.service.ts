import { Injectable } from '@angular/core';
import { TimelineService } from './timeline.service';
import { BehaviorSubject } from 'rxjs';
import { MovieService } from './movie.service';
import { ServiceBase } from '../base/service-base';
import html2canvas from 'html2canvas';
import { FileService } from './file.service';

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

  startRecording(): void {
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
      this.stopRecording();
      return;
    }

    // frames pending to capture
    if (frameCanvas.length < this.timelineService.framesPerUnitTime) {
      this.captureFrame(frameCanvas);

    } else { // store all collected frames and increase time
      if (this.timelineService.hasNextTime()) {

        this.recordedFrames = this.recordedFrames.concat(frameCanvas);
        this.timelineService.increaseTime();
        this.runWhileRecording([]);
      } else this.stopRecording();
    }
  }

  captureFrame(frameCanvas: HTMLCanvasElement[]): void {
    const divElement = document.getElementById(this.canvasContainerId); // Replace with your div's ID
    if (!divElement) {
      this.stopRecording();
      return;
    }
    this.animationPausedForCapture.next(true);

    setTimeout(() => {
      html2canvas(divElement)
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
    }, 1000);
  }

  stopRecording(): void {
    this.recording.next(false);
    this.timelineService.resetMaxPlayTime();
    this.saveCanvasAsVideo();
  }

  saveCanvasAsVideo() {
    if (!this.recordedFrames || this.recordedFrames.length === 0) return;

    const promises = this.recordedFrames.map(c => new Promise<Blob | null>(resolve => c.toBlob(blob => resolve(blob))));
    if (promises && promises.length > 0) {

      Promise.all(promises).then(arrBlob => {
        const arrNonUllBlobs: Blob[] = [];

        arrBlob.map(b => b ? arrNonUllBlobs.push(b) : false);
        this.fileService.generateVideo(
          arrNonUllBlobs,
          (this.timelineService.frameSpeedByPerUnitTime)
        );

      });
    }
  }
}
