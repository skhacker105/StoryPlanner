export interface ILayerAudio {
    layerId: string;
    memberId: string;
    memberOptionId: string;
    startTime: number;
    endTime: number;
    length: number;
    file: string | ArrayBuffer;
    currentTimeInRange?: boolean;
}