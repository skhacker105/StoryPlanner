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
    styleString += this.getTransform(layer);

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
    if (layer.opacity || layer.opacity === 0) r += `opacity: ${layer.opacity}; `;
    return r;
  }

  getTransform(layer: ILayer): string {
    let r = '';
    r += this.generateTransformFunction(layer, 'rotateX', 'deg')
    + this.generateTransformFunction(layer, 'rotateY', 'deg')
    + this.generateTransformFunction(layer, 'rotateZ', 'deg')
    + this.generateTransformFunction(layer, 'translateX', 'px')
    + this.generateTransformFunction(layer, 'translateY', 'px')
    + this.generateTransformFunction(layer, 'translateZ', 'px')
    + this.generateTransformFunction(layer, 'scaleX', '')
    + this.generateTransformFunction(layer, 'scaleY', '')
    + this.generateTransformFunction(layer, 'skewX', 'deg')
    + this.generateTransformFunction(layer, 'skewY', 'deg')
    return r ? `transform: ${r}; ` : '';
  }

  generateTransformFunction(layer: any, key: string, unit: string) {
    if (layer[key]) return `${key}(${layer[key]}${unit}) `;
    return '';
  }
 
}
