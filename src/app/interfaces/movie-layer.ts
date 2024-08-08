import { ILayerAnimation } from "./movie-animations";
import { ILayerRepeat } from "./movie-layer-repeat";
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