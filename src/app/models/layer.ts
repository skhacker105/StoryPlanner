import { ILayer } from "../interfaces/movie-layer";

export function createLayerWithDefaultProperties(layerId: string, time: number, memberId: string, memberOptionId: string): ILayer {
    return {
        layerId,
        memberId,
        memberOptionId,
        stackPosition: 0,
        isProjected: false,
        projectionStartTime: 0,
        animations: [],

        // Generic
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
      } as ILayer
}