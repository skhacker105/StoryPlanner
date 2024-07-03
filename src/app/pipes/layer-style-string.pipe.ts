import { Pipe, PipeTransform } from '@angular/core';
import { ILayer } from '../interfaces/movie-layer';

@Pipe({
  name: 'layerStyleString'
})
export class LayerStyleStringPipe implements PipeTransform {

  transform(layer: ILayer): string {
    let styleString = 'position: absolute; ';

    // If not in view then set display: none
    if (!layer.isInView) {
      styleString += 'display: none; ';
      return styleString;
    }

    styleString += this.getDimensionStyles(layer);
    styleString += this.getPositionStyles(layer);
    styleString += this.getZIndex(layer);

    return styleString;
  }

  getDimensionStyles(layer: ILayer): string {
    // If full screen se set width and height as 100 %

    let r = '';
    if (layer.isFullScreen) {
      r += 'widht: 100%; height: 100%; ';
    } else {
      r += `widht: ${layer.relativeWidth}%; height: ${layer.relativeHeight}%; `;
    }
    return r;
  }

  getPositionStyles(layer: ILayer): string {
    return `left: ${layer.relativeLeft}%; top: ${layer.relativeTop}%; `;
  }

  getZIndex(layer: ILayer): string {
    return `z-index: ${(layer.stackPosition * 10)}; `
  }

}
