import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FileControl } from '../../../../types/picture.type';

@Component({
  selector: 'app-video-icon',
  templateUrl: './video-icon.component.html',
  styleUrl: './video-icon.component.scss'
})
export class VideoIconComponent implements OnChanges {
  @Input() video?: FileControl;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  thumbnailSrc: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      this.loadThumbnail();
    }, 500);
  }

  loadThumbnail() {
    if (!this.video || !this.videoPlayer || !this.canvas || typeof this.video !== 'string') {
      this.thumbnailSrc = '';
      return;
    }

    const video = this.videoPlayer.nativeElement;
    video.src = this.video; //URL.createObjectURL(videoBlob);
    video.load();
    video.play();

    video.onloadeddata = () => {
      const canvas = this.canvas.nativeElement;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
  
        // Draw the current frame of the video on the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
        // Create a data URL of the image
        this.thumbnailSrc = canvas.toDataURL('image/png');
  
        // Optionally stop video playback
        video.pause();
      }
    }

    video.onerror = (err) => {
      console.log('Could not load video.')
    }
  }
}
