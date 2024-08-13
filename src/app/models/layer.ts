import { cloneDeep } from "lodash";
import { ILayer } from "../interfaces/movie-layer";
import { ILayerProperties } from "../interfaces/movie-properties";
import { ILayerRepeat } from "../interfaces/movie-layer-repeat";
import { IMemberOption } from "../interfaces/member";

export function CreateLayerWithDefaultProperties(
  layerId: string,
  time: number,
  memberId: string,
  memberOption: IMemberOption,
  timeMultiplier: number,
  isProjected?: boolean,
  projectionStartTime?: number): ILayer {

  return {
    layerId,
    memberId,
    memberOptionId: memberOption.optionId,
    isProjected: isProjected ?? false,
    projectionStartTime: projectionStartTime ?? time,

    animations: [],
    repeating: undefined,
    animation: undefined,
    media: memberOption.type === 'audio' || memberOption.type === 'video'
    ? { isMuted: false, startTime: 0, endTime: memberOption.length }
    : undefined,

    properties: memberOption.type === 'audio' || memberOption.type === 'video'
      ? GetDefaultProperties(time + (memberOption.length / timeMultiplier))
      : GetDefaultProperties(time)

  } as ILayer
}

export function GetDefaultProperties(endTime: number): ILayerProperties {
  return {
    // Generic
    stackPosition: 0,
    isInView: true,
    isFullScreen: false,
    opacity: 1.0,
    endTime,

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

export function CreateRepeatedLayer(newLayerId: string, layer: ILayer, newRepeating: ILayerRepeat, newTime: number, projectionStartTime: number): ILayer {
  const obj = {
    ...cloneDeep(layer),
    repeating: newRepeating,
    layerId: newLayerId
  }
  obj.properties.endTime = newTime + (obj.properties.endTime - projectionStartTime);
  return obj;
}