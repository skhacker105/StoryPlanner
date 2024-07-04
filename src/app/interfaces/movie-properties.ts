export interface ILayerGeneric {
    opacity: number;
}

export interface ILayerDimension {
    relativeWidth: number;
    relativeHeight: number;
}

export interface ILayerPosition {
    relativeLeft: number;
    relativeTop: number;
}

export interface ILayerPlayTime {
    endTime: number;
}

export interface IRotate {
    rotateX: number;
    rotateY: number;
    rotateZ: number;
}

export interface ITranslate {
    translateX: number;
    translateY: number;
    translateZ: number;
}

export interface IScale {
    scaleX: number;
    scaleY: number;
}

export interface ISkew {
    skewX: number;
    skewY: number;

}
