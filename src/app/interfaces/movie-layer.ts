import { extend } from "lodash";
import { IMovieAnimation } from "./movie-animations";
import { ILayerDimension, ILayerPosition, ILayerPlayTime, ILayerGeneric, IRotate, ITranslate, IScale, ISkew } from "./movie-properties";

export interface ILayer extends ILayerProperties {

    // :Fields
    layerId: string;
    isProjected: boolean;
    memberId: string;
    memberOptionId: string;
    projectionStartTime: number;
    animations: IMovieAnimation[];

    // :Properties
}

export interface ILayerProperties extends
ILayerDimension,
ILayerPosition,
ILayerPlayTime,
ILayerGeneric,
IRotate,
ITranslate,
IScale,
ISkew {
    stackPosition: number;
    isInView: boolean;
    isFullScreen: boolean;
}
