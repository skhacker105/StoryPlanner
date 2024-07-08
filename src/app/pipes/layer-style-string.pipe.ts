import { Pipe, PipeTransform } from '@angular/core';
import { ILayer } from '../interfaces/movie-layer';
import { ILayerProperties } from '../interfaces/movie-properties';
import { StyleService } from '../services/style.service';

@Pipe({
  name: 'layerStyleString'
})
export class LayerStyleStringPipe implements PipeTransform {

  constructor(private styleService: StyleService) {}

  transform(layer: ILayer): string {
    return this.styleService.getPropertiesString(layer.properties);
  }
 
}
