import { IMemberStorage } from "./member-storage";
import { ILayer } from "./movie-layer";
import { IVersion } from "./version";

export interface IMovie {
    id: string;
    memberBook: IMovieMemberBook;
    movieName: string;
    version: IVersion;
    timeline: { [key: number]: IMovieTime }
}

export interface IMovieTime {
    time: number;
    layers: ILayer[];
}

export interface IMovieMemberBook {
    version: string;
    name: string;
}

export interface IMovieTimeLayer {
    [key: number]: {layer:ILayer; isProjected: boolean; isRepeated: boolean};
}