import { Injectable } from '@angular/core';
import { IVersion } from '../interfaces/version';
import { UtilService } from './util.service';
import { MemberService } from './member.service';
import { IMovie, IMovieMemberBook } from '../interfaces/timeline-movie';
import { Subject } from 'rxjs';
import { IMemberStorage } from '../interfaces/member-storage';
import { Movie } from '../models/movie';
import { Member } from '../models/members';
import { ILayer } from '../interfaces/movie-layer';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  movieLocalStorageKey = 'movie';

  movie?: IMovie;
  movieUpdated = new Subject<IMovie>();

  constructor(private utilService: UtilService, private memberService: MemberService) {

    this.movieUpdated
      .subscribe({
        next: movie => this.saveMovieToLocalStorage(movie)
      });

    this.memberService.memberStorageUpdated
      .subscribe({
        next: memberStorage => {
          if (!this.movie) this.loadMovieFromLocalStorage(memberStorage);
          else {
            if (memberStorage.name !== this.movie.memberBook.name) this.movie.memberBook.name = memberStorage.name;
            if (memberStorage.version !== this.movie.memberBook.version) this.movie.memberBook.version = memberStorage.version;
            this.movieUpdated.next(this.movie);
          }
        }
      });
  }

  get versionNoString(): string {
    if (!this.movie) return '';

    const defaultPad = (val: number) => val.toString().padStart(2, '0');
    return defaultPad(this.movie.version.primary) + ':' + defaultPad(this.movie.version.major) + ':' + defaultPad(this.movie.version.minor);
  }

  createDefaultMovie(memberBook: IMemberStorage): void {
    this.movie = new Movie({
      memberBook: {
        name: memberBook.name,
        version: memberBook.version
      },
      movieName: 'MyMovie',
      timeline: {},
      version: {
        primary: 0,
        major: 0,
        minor: 1
      }
    } as IMovie);
    this.movieUpdated.next(this.movie);
  }

  loadMovieFromLocalStorage(memberBook: IMemberStorage): void {
    const savedMovie = localStorage.getItem(this.movieLocalStorageKey);
    if (!savedMovie) this.createDefaultMovie(memberBook);
    else {
      const storedMovie: IMovie = JSON.parse(savedMovie);

      if (storedMovie.memberBook.name !== memberBook.name || storedMovie.memberBook.version !== memberBook.version) {
        console.log('Locally saved movie do not matches with your locally saved Book')
      } else {
        this.movie = new Movie(storedMovie);
        this.movieUpdated.next(this.movie);
      }
    }
  }

  saveMovieToLocalStorage(movie: IMovie): void {
    localStorage.setItem(this.movieLocalStorageKey, JSON.stringify(movie));
  }

  addMemberOptionToTime(time: number, memberId: string, memberOptionId: string): void {
    if (!this.movie) {
      console.log('No movie to add layer');
      return;
    }

    if (!this.movie.timeline[time]) {
      this.movie.timeline[time] = {
        time,
        layers: []
      }
    }

    const newLayer: ILayer = {
      layerId: this.utilService.generateNewId(),
      memberId,
      memberOptionId,
      stackPosition: this.movie.timeline[time].layers.length + 1,
      isInView: true,
      isFullScreen: false,

      relativeWidth: 100,
      relativeHeight: 100,

      relativeLeft: 0,
      relativeTop: 0
    }

    this.movie.timeline[time].layers.push(newLayer);
    this.movieUpdated.next(this.movie);
  }
}
