import { CssDirection, CssFillMode, CssTimingFunction } from "../types/movie-animation";
import { ILayerProperties } from "./movie-properties";

export interface ILayerAnimation {
    duration: number;
    delay: number;
    iterationCount?: number;
    direction: CssDirection;
    timingFunction: CssTimingFunction;
    fillMode: CssFillMode;
    frame: IAnimationFrame;
}

export interface IAnimationFrame {
    toLayer?: ILayerProperties,
    percentFrame?: { [percent: string]: ILayerProperties }
}