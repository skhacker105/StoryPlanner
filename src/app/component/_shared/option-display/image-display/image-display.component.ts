import { Component, Input } from '@angular/core';
import { FileControl } from '../../../../types/picture.type';

@Component({
  selector: 'app-image-display',
  templateUrl: './image-display.component.html',
  styleUrl: './image-display.component.scss'
})
export class ImageDisplayComponent {
  @Input() file?: FileControl;
}
