import { ILayerAnimation } from "./movie-animations";
import { ILayerProperties } from "./movie-properties";

export interface ILayer {

    // :Fields
    layerId: string;
    isProjected: boolean;
    memberId: string;
    memberOptionId: string;
    projectionStartTime: number;
    properties: ILayerProperties
    animation?: ILayerAnimation;
}
