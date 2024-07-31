import { cloneDeep } from "lodash";
import { ILayer, ILayerRepeat } from "../interfaces/movie-layer";
import { ILayerProperties } from "../interfaces/movie-properties";

export function CreateLayerWithDefaultProperties(layerId: string, time: number, memberId: string, memberOptionId: string): ILayer {
  return {
    layerId,
    memberId,
    memberOptionId,
    isProjected: false,
    projectionStartTime: time,
    animations: [],
    repeating: undefined,

    properties: GetDefaultProperties(time),

    // Animation
    animation: undefined
  } as ILayer
}

export function GetDefaultProperties(time: number): ILayerProperties {
  return {
    // Generic
    stackPosition: 0,
    isInView: true,
    isFullScreen: false,
    opacity: 1.0,
    endTime: time,

    // Dimension
    relativeWidth: 100,
    relativeHeight: 100,

    // Position
    relativeLeft: 0,
    relativeTop: 0,

    // Rotate
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,

    // Translate
    translateX: 0,
    translateY: 0,
    translateZ: 0,

    // Scale
    scaleX: 0,
    scaleY: 0,

    // Skew
    skewX: 0,
    skewY: 0
  }
}

export function CreateRepeatedLayer(newLayerId: string, layer: ILayer, newRepeating: ILayerRepeat, time: number): ILayer {
  const obj = {
    ...cloneDeep(layer),
    repeating: newRepeating,
    layerId: newLayerId
  }
  obj.properties.endTime = time;
  return obj;
}