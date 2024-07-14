import { Injectable } from '@angular/core';
import { ILayerProperties } from '../interfaces/movie-properties';
import { ILayerAnimation } from '../interfaces/movie-animations';
import { ILayer } from '../interfaces/movie-layer';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  constructor() { }

  // Properties
  getPropertiesString(properties: ILayerProperties): string {
    let styleString = 'position: absolute; ';

    // If not in view then set display: none
    if (!properties.isInView) {
      styleString += 'display: none; ';
      return styleString;
    }

    styleString += this.getDimensionStyles(properties);
    styleString += this.getPositionStyles(properties);
    styleString += this.getZIndex(properties);
    styleString += this.getOpacity(properties);
    styleString += this.getTransform(properties);

    return styleString;
  }

  getDimensionStyles(properties: ILayerProperties): string {
    // If full screen se set width and height as 100 %

    let r = '';
    if (properties.isFullScreen) {
      r += 'widht: 100%; height: 100%; ';
    } else {
      if (properties.relativeWidth) r += `width: ${properties.relativeWidth}%; `;
      if (properties.relativeHeight) r += `height: ${properties.relativeHeight}%; `;
    }
    return r;
  }

  getPositionStyles(properties: ILayerProperties): string {
    let r='';
    if (properties.relativeLeft) r += `left: ${properties.relativeLeft}%; `;
    if (properties.relativeTop) r += `top: ${properties.relativeTop}%; `;
    return r;
  }

  getZIndex(properties: ILayerProperties): string {
    return `z-index: ${(properties.stackPosition * 10)}; `
  }

  getOpacity(properties: ILayerProperties):string {
    let r='';
    if (properties.opacity || properties.opacity === 0) r += `opacity: ${properties.opacity}; `;
    return r;
  }

  getTransform(properties: ILayerProperties): string {
    let r = '';
    r += this.generateTransformFunction(properties, 'rotateX', 'deg')
    + this.generateTransformFunction(properties, 'rotateY', 'deg')
    + this.generateTransformFunction(properties, 'rotateZ', 'deg')
    + this.generateTransformFunction(properties, 'translateX', 'px')
    + this.generateTransformFunction(properties, 'translateY', 'px')
    + this.generateTransformFunction(properties, 'translateZ', 'px')
    + this.generateTransformFunction(properties, 'scaleX', '')
    + this.generateTransformFunction(properties, 'scaleY', '')
    + this.generateTransformFunction(properties, 'skewX', 'deg')
    + this.generateTransformFunction(properties, 'skewY', 'deg')
    return r ? `transform: ${r}; ` : '';
  }

  generateTransformFunction(properties: any, key: string, unit: string) {
    if (properties[key]) return `${key}(${properties[key]}${unit}) `;
    return '';
  }

  // Animation
  getAnimationString(layer: ILayer): string {
    if (!layer.animation) return '';

    let animationString = '';
    animationString += this.getAnimationBasicPropertiesString(layer, layer.animation);
    return animationString ? `animation: ${animationString};` : '';
  }

  keyFrameName(layer: ILayer): string {
    return 'MA_' + layer.layerId;
  }

  getAnimationBasicPropertiesString(layer: ILayer, animation: ILayerAnimation): string {
    let str = '';
    str += this.keyFrameName(layer) + ' ';
    str += animation.duration !== undefined ? animation.duration + 's ' : '';
    str += animation.timingFunction !== undefined ? animation.timingFunction + ' ' : '';
    str += animation.delay !== undefined ? animation.delay + 's ' : '';
    str += animation.iterationCount !== undefined ? (animation.iterationCount === 0 ? 'infinite' : animation.iterationCount.toString()) + ' ' : '';
    str += animation.direction !== undefined ? animation.direction + ' ' : '';
    str += animation.fillMode !== undefined ? animation.fillMode + ' ' : '';
    return str;
  }

  getAnimationFrameString(layer: ILayer): string {
    if (!layer.animation) return '';

    let str = '';
    const animation = layer.animation;
    const start = `@keyframes ${this.keyFrameName(layer)} { `;
    if (animation.frame) {

      if (animation.frame.toLayer) {
        animation.frame.toLayer.stackPosition = layer.properties.stackPosition
        str += ' from {' + this.getPropertiesString(layer.properties) + '} \
        to {' + this.getPropertiesString(animation.frame.toLayer) + '} ';

      } else if (animation.frame.percentFrame) {
        for (let percent in animation.frame.percentFrame) {
          str += percent + `% { ${this.getPropertiesString(animation.frame.percentFrame[+percent])} } `;
        }
      }
    }
    return str ? start +  str + '} ' : '';
  }
}
