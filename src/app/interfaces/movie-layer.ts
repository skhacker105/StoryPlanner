import { ILayerAnimation } from "./movie-animations";
import { ILayerProperties } from "./movie-properties";

export interface ILayer {

    // :Fields
    layerId: string;
    memberId: string;
    memberOptionId: string;

    properties: ILayerProperties
    animation?: ILayerAnimation;
    repeating?: ILayerRepeat;
    
    // Projection
    isProjected: boolean;
    projectionStartTime: number;
}


export interface ILayerRepeat {
    layerId: string;
    repeatingStartTime: number;
    interval: number;
    count: number;
}