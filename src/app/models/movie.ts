import { ILayer } from "../interfaces/movie-layer";
import { IMovie, IMovieMemberBook, IMovieTime } from "../interfaces/timeline-movie";
import { IVersion } from "../interfaces/version";

export class Movie implements IMovie {
    memberBook: IMovieMemberBook;
    movieName: string;
    version: IVersion;
    timeline: { [key: number]: IMovieTime; };

    constructor(movie: IMovie) {
        this.movieName = movie.movieName;
        this.version = movie.version;
        this.timeline = movie.timeline;
        this.memberBook = movie.memberBook;
    }

    public removeLayer(time: number, layerId: string): void {

        const timeLine = this.timeline[time];
        if (!timeLine) {
            console.log('No Timeline found to update');
            return;
        }

        const layerIndex = timeLine.layers.findIndex(l => l.layerId === layerId);
        if (layerIndex < 0) {
            console.log('No Layer found to update');
            return;
        }

        timeLine.layers.splice(layerIndex, 1);
    }

    public updateLayer(time: number, newLayer: ILayer): void {

        const timeLine = this.timeline[time];
        if (!timeLine) {
            console.log('No Timeline found to update');
            return;
        }

        const layerIndex = timeLine.layers.findIndex(l => l.layerId === newLayer.layerId);
        if (layerIndex < 0) {
            console.log('No Layer found to update');
            return;
        }

        timeLine.layers[layerIndex] = Object.assign({}, timeLine.layers[layerIndex], newLayer )
    }

}