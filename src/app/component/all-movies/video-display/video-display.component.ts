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
  @Output() onCLick = new EventEmitter<Video>();

  handleDeleteClick(member: Video, e: any) {
    e.stopPropagation();
    this.onDelete.emit(member);
  }
}
