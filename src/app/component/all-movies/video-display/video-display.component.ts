import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Video } from '../../../models/video';

@Component({
  selector: 'app-video-display',
  templateUrl: './video-display.component.html',
  styleUrl: './video-display.component.scss'
})
export class VideoDisplayComponent {
  @Input() video?: Video;
  @Input() isSelected = false;
  @Output() onDelete = new EventEmitter<Video>();
  @Output() onClick = new EventEmitter<Video>();

  handleDeleteClick(member: Video, e: any): void {
    e.stopPropagation();
    this.onDelete.emit(member);
  }

  downloadVideo(e: any): void {
    e.stopPropagation();
    if (!this.video) return;

    let link = document.createElement("a");
    link.download = "image.mp4";
    link.href = URL.createObjectURL(this.video.blob);
    link.click();
  }
}
