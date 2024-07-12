import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Video } from '../models/video';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  fileProcessing = false;
  renderingFrame = false;
  progressPercent = 0;
  newVideo = new Subject<Video>();

  constructor(private util: UtilService) { }

  saveFramesAsVideo(recordedFrames: HTMLCanvasElement[], frameDelay: number, videoLength: number): void {
    const promises = recordedFrames.map(c => new Promise<Blob | null>(resolve => c.toBlob(blob => resolve(blob))));
    if (promises && promises.length > 0) {

      this.fileProcessing = true;
      this.progressPercent = 0;
      Promise.all(promises).then(arrBlob => {
        const arrNonUllBlobs: Blob[] = [];

        arrBlob.map(b => b ? arrNonUllBlobs.push(b) : false);
        this.generateVideo(arrNonUllBlobs, frameDelay, videoLength);

      });
    }
  }

  private async generateVideo(images: Blob[], frameDelay: number, videoLength: number) {
    if (images.length === 0) {
      console.log('No frames found to create video.');
      return;
    }

    this.renderingFrame = true;
    try {
      const chunks: Blob[] = [];
      const percent = 100 / images.length;
      const { canvas, ctx } = await this.createCanvas(images[0]);
      const { mediaRecorder, stopRecording } = this.createMediaRecorder(canvas, chunks, videoLength);

      // Draw each image on the canvas and record
      let i = 0;
      for (const imageBlob of images) {
        await this.drawBlobImage(imageBlob, ctx, canvas.width, canvas.height);

        // Delay between all frame images
        await new Promise(resolve => setTimeout(() => resolve(null), frameDelay));

        // Start recording after the first image is drawn
        if (mediaRecorder.state === 'inactive') {
          mediaRecorder.start();
        }

        // Track completePercent
        i++;
        this.progressPercent = (i * percent);
      }
      this.renderingFrame = false;

      // Stop recording after a short delay (adjust as needed)
      setTimeout(
        () => stopRecording(),
        (frameDelay * (images.length - 1))
      );

    } catch (error) {
      this.renderingFrame = false;
      this.fileProcessing = false;
      console.error('Error generating video:', error);
    }
  }

  private async drawBlobImage(imageBlob: Blob, ctx: CanvasRenderingContext2D, width: number, height: number) {
    const img = new Image();
    img.src = URL.createObjectURL(imageBlob);
    await new Promise(resolve => {
      img.onload = () => resolve(null);
    });
    ctx.drawImage(img, 0, 0, width, height);
  }

  private async createCanvas(sampleImage: Blob) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context is not supported');
    }

    // Set canvas dimensions based on the first image (assuming all images are the same size)
    await this.setCanvasDimensions(canvas, sampleImage);
    return { canvas, ctx }
  }

  private createMediaRecorder(canvas: HTMLCanvasElement, chunks: Blob[], videoLength: number) {
    const stream = canvas.captureStream();
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = (event) => this.handleMediaRecorderData(event, chunks);
    mediaRecorder.onstop = () => this.handleMediaRecorderStop(chunks, videoLength);
    const stopRecording = () => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }
    return { mediaRecorder, stopRecording }
  }

  private async setCanvasDimensions(canvas: HTMLCanvasElement, sampleImage: Blob) {
    const firstImage = new Image();
    firstImage.src = URL.createObjectURL(sampleImage);
    await new Promise(resolve => {
      firstImage.onload = () => resolve(null);
    });

    canvas.width = firstImage.width;
    canvas.height = firstImage.height;
  }

  private handleMediaRecorderData(event: BlobEvent, chunks: Blob[]): void {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  }

  private handleMediaRecorderStop(chunks: Blob[], videoLength: number) {
    // Combine all recorded chunks into a single Blob
    const videoBlob = new Blob(chunks, { type: 'video/webm' });
    this.newVideo.next(new Video({
      id: this.util.generateNewId(),
      blob: videoBlob,
      name: '',
      videoLength,
      createdOn: new Date()
    }));

    // Reset
    this.fileProcessing = false;
  }
}
