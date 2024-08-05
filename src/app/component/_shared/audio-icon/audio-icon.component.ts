import { Component, Input } from '@angular/core';
import { FileControl } from '../../../types/picture.type';

@Component({
  selector: 'app-audio-icon',
  templateUrl: './audio-icon.component.html',
  styleUrl: './audio-icon.component.scss'
})
export class AudioIconComponent {
  @Input() audio?: FileControl;
}
