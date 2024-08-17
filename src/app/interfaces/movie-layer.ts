import { ILayerAnimation } from "./movie-animations";
import { ILayerRepeat } from "./movie-layer-repeat";
import { IlayerMedia } from "./movie-media";
import { ILayerProperties } from "./movie-properties";

export interface ILayer {

    // :Fields
    layerId: string;
    memberId: string;
    memberOptionId: string;

    properties: ILayerProperties
    animation?: ILayerAnimation;
    repeating?: ILayerRepeat;
    media?: IlayerMedia;
    
    // Projection
    isProjected: boolean;
    projectionStartTime: number;
}


export interface ILayersById { [key: string]: ILayer }