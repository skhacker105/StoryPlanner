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
    styleString += this.getOpacity(layer);

    return styleString;
  }

  getDimensionStyles(layer: ILayer): string {
    // If full screen se set width and height as 100 %

    let r = '';
    if (layer.isFullScreen) {
      r += 'widht: 100%; height: 100%; ';
    } else {
      if (layer.relativeWidth) r += `width: ${layer.relativeWidth}%; `;
      if (layer.relativeHeight) r += `height: ${layer.relativeHeight}%; `;
    }
    return r;
  }

  getPositionStyles(layer: ILayer): string {
    let r='';
    if (layer.relativeLeft) r += `left: ${layer.relativeLeft}%; `;
    if (layer.relativeTop) r += `top: ${layer.relativeTop}%; `;
    return r;
  }

  getZIndex(layer: ILayer): string {
    return `z-index: ${(layer.stackPosition * 10)}; `
  }

  getOpacity(layer: ILayer):string {
    let r='';
    if (layer.opacity) r += `opacity: ${layer.opacity}; `;
    return r;
  }

}
