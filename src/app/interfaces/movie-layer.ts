import { ILayerAnimation } from "./movie-animations";
import { ILayerProperties } from "./movie-properties";

export interface ILayer extends ILayerProperties {

    // :Fields
    layerId: string;
    isProjected: boolean;
    memberId: string;
    memberOptionId: string;
    projectionStartTime: number;
    animation?: ILayerAnimation;
}
