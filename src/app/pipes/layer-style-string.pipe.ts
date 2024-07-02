import { Pipe, PipeTransform } from '@angular/core';
import { ILayer } from '../interfaces/movie-layer';

@Pipe({
  name: 'layerStyleString'
})
export class LayerStyleStringPipe implements PipeTransform {

  transform(layer: ILayer, screenWidth: number, screenHeight: number): string {
    let styleString = 'position: absolute; ';

    // If not in view then set display: none
    if (!layer.isInView) {
      styleString = 'diaplay: none; ';
      return styleString;
    }

    styleString += this.getDimensionStyles(layer, screenWidth, screenHeight);
    styleString += this.getPositionStyles(layer, screenWidth, screenHeight);
    styleString += this.getZIndex(layer);

    return styleString;
  }

  getDimensionStyles(layer: ILayer, screenWidth: number, screenHeight: number): string {
    // If full screen se set width and height as 100 %

    let r = '';
    if (layer.isFullScreen) {
      r += 'widht: 100%; height: 100%; ';
    } else {
      const width = Math.floor((layer.relativeWidth / 100) * screenWidth);
      const height = Math.floor((layer.relativeHeight / 100) * screenHeight);
      r += `widht: ${width}px; height: ${height}px; `;
    }
    return r;
  }

  getPositionStyles(layer: ILayer, screenWidth: number, screenHeight: number): string {
    return `left: 0; top: 0; `;
  }

  getZIndex(layer: ILayer): string {
    return `z-index: ${(layer.stackPosition * 10)}; `
  }

}
