import { Component, Input } from '@angular/core';
import { ILayer } from '../../interfaces/movie-layer';

@Component({
  selector: 'app-layer-properties',
  templateUrl: './layer-properties.component.html',
  styleUrl: './layer-properties.component.scss'
})
export class LayerPropertiesComponent {

  @Input() layer?: ILayer;
}
