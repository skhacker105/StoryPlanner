export interface ILayer extends
    ILayerDimension,
    ILayerPosition {

    // Fields
    layerId: string;
    memberId: string;
    memberOptionId: string;
    stackPosition: number;

    // Properties
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