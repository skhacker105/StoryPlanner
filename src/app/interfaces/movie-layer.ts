export interface ILayer extends
    ILayerDimension,
    ILayerPosition,
    ILayerPlayTime {

    // Fields
    layerId: string;
    memberId: string;
    memberOptionId: string;

    // Properties
    stackPosition: number;
    isInView: boolean;
    isFullScreen: boolean;
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
    duration: number;
}