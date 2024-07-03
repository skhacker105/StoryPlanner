export interface ILayer extends
    ILayerDimension,
    ILayerPosition,
    ILayerPlayTime {

    // Fields
    layerId: string;
    isProjected: boolean;
    memberId: string;
    memberOptionId: string;
    projectionStartTime: number;

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
    endTime: number;
}