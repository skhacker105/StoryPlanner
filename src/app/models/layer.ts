import { ILayer } from "../interfaces/movie-layer";

export function createLayerWithDefaultProperties(layerId: string, time: number, memberId: string, memberOptionId: string): ILayer {
    return {
        layerId,
        memberId,
        memberOptionId,
        stackPosition: 0,
        isInView: true,
        isFullScreen: false,
        isProjected: false,
        projectionStartTime: 0,
        opacity: 1.0,
  
        relativeWidth: 100,
        relativeHeight: 100,
  
        relativeLeft: 0,
        relativeTop: 0,
  
        endTime: time
      } as ILayer
}