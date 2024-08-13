import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileControl } from '../../../../types/picture.type';

@Component({
  selector: 'app-video-icon',
  templateUrl: './video-icon.component.html',
  styleUrl: './video-icon.component.scss'
})
export class VideoIconComponent {
  @Input() video?: FileControl;
  @Input() thumbnail: string = '';
  @Output() onIconClick = new EventEmitter<void>();
}
