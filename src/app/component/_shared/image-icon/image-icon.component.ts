import { Component, Input } from '@angular/core';
import { ImageControl } from '../../../types/picture.type';

@Component({
  selector: 'app-image-icon',
  templateUrl: './image-icon.component.html',
  styleUrl: './image-icon.component.scss'
})
export class ImageIconComponent {
  @Input() image?: ImageControl;
}
