import { IVideo } from "../interfaces/video";

export class Video implements IVideo {
    id: string;
    blob: Blob;
    name: string;
    createdOn: Date;
    videoLength: number;
    
    constructor(obj: IVideo) {
        this.id = obj.id;
        this.name = obj.name;
        this.blob = obj.blob;
        this.createdOn = obj.createdOn;
        this.videoLength = obj.videoLength;
    }
}