import { Injectable } from '@angular/core';
import { chunk } from 'lodash';
import { Observable, forkJoin, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  async generateVideo(images: Blob[]) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context is not supported');
      }

      // Set canvas dimensions based on the first image (assuming all images are the same size)
      const firstImage = new Image();
      firstImage.src = URL.createObjectURL(images[0]);
      await new Promise(resolve => {
        firstImage.onload = () => resolve(null);
      });

      canvas.width = firstImage.width;
      canvas.height = firstImage.height;

      // Create a MediaRecorder instance
      const stream = canvas.captureStream();
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Combine all recorded chunks into a single Blob
        const videoBlob = new Blob(chunks, { type: 'video/webm' });

        // Create URL for the video blob
        const videoUrl = URL.createObjectURL(videoBlob);

        // Display video in video element
        const videoElement = document.createElement('video');
        videoElement.src = videoUrl;
        videoElement.style.width = '100%'
        videoElement.controls = true;
        document.getElementById('canvas-video')?.appendChild(videoElement);
        videoElement.play();
      };

      // Draw each image on the canvas and record
      for (const imageBlob of images) {
        const img = new Image();
        img.src = URL.createObjectURL(imageBlob);
        await new Promise(resolve => {
          img.onload = () => resolve(null);
        });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        await new Promise(resolve => setTimeout(() => {
          resolve(null);
        }, 500));
        // Start recording after the first image is drawn
        if (mediaRecorder.state === 'inactive') {
          mediaRecorder.start();
        }
      }

      // Stop recording after a short delay (adjust as needed)
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 1); // Assuming 1 second per image, adjust as needed

    } catch (error) {
      console.error('Error generating video:', error);
    }
  }

  async generateVideo1(images: Blob[]) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context is not supported');
      }

      // Set canvas dimensions based on the first image (assuming all images are the same size)
      const firstImage = new Image();
      firstImage.src = URL.createObjectURL(images[0]);
      await new Promise(resolve => {
        firstImage.onload = () => resolve(null);
      });

      canvas.width = firstImage.width;
      canvas.height = firstImage.height;

      // Create a MediaRecorder instance
      const stream = canvas.captureStream();
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Combine all recorded chunks into a single Blob
        const videoBlob = new Blob(chunks, { type: 'video/webm' });

        // Create URL for the video blob
        const videoUrl = URL.createObjectURL(videoBlob);

        // Display video in video element
        const videoElement = document.createElement('video');
        videoElement.src = videoUrl;
        videoElement.style.width = '100%'
        videoElement.controls = true;
        document.getElementById('canvas-video')?.appendChild(videoElement);
        videoElement.play();
      };

      // Draw each image on the canvas and record
      for (const imageBlob of images) {
        const img = new Image();
        img.src = URL.createObjectURL(imageBlob);
        await new Promise(resolve => {
          img.onload = () => resolve(null);
        });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        await new Promise(resolve => setTimeout(() => {
          resolve(null);
        }, 500));
        // Start recording after the first image is drawn
        if (mediaRecorder.state === 'inactive') {
          mediaRecorder.start();
        }
      }

      // Stop recording after a short delay (adjust as needed)
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 1); // Assuming 1 second per image, adjust as needed

    } catch (error) {
      console.error('Error generating video:', error);
    }
  }
}
