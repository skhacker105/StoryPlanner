import { Pipe, PipeTransform } from '@angular/core';
import { ILayer } from '../interfaces/movie-layer';
import { ILayerAnimation } from '../interfaces/movie-animations';
import { LayerStyleStringPipe } from './layer-style-string.pipe';
import { StyleService } from '../services/style.service';

@Pipe({
  name: 'layerAnimationString'
})
export class LayerAnimationStringPipe implements PipeTransform {

  constructor(private styleService: StyleService) { }

  transform(layer: ILayer): string {
    return this.styleService.getAnimationString(layer);
  }

}
