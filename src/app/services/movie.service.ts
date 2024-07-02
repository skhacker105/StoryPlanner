import { Injectable, OnDestroy } from '@angular/core';
import { UtilService } from './util.service';
import { MemberService } from './member.service';
import { IMovie } from '../interfaces/timeline-movie';
import { Subject, takeUntil } from 'rxjs';
import { IMemberStorage } from '../interfaces/member-storage';
import { Movie } from '../models/movie';
import { ILayer } from '../interfaces/movie-layer';
import { ServiceBase } from '../base/service-base';

@Injectable({
  providedIn: 'root'
})
export class MovieService extends ServiceBase implements OnDestroy {

  movieLocalStorageKey = 'movie';

  movie?: Movie;
  movieUpdated = new Subject<IMovie>();

  constructor(private utilService: UtilService, private memberService: MemberService) {
    super();

    this.movieUpdated
    .pipe(takeUntil(this.isServiceActive))
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

  ngOnDestroy(): void {
    this.onDestroy();
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

    const newLayer: ILayer = {
      layerId: this.utilService.generateNewId(),
      memberId,
      memberOptionId,
      stackPosition: 0,
      isInView: true,
      isFullScreen: false,
      isProjected: false,

      relativeWidth: 100,
      relativeHeight: 100,

      relativeLeft: 0,
      relativeTop: 0,

      endTime: time
    }

    this.movie.addMemberOptionToTime(time, memberId, memberOptionId, newLayer);
    this.movieUpdated.next(this.movie);
  }

  updateLayer(time: number, newLayer: ILayer): void {
    if (!this.movie) return;

    this.movie.updateLayer(time, newLayer);
    this.movieUpdated.next(this.movie);
  }

  removeLayer(time: number, layerId: string): void {
    if (!this.movie) return;

    this.movie.removeLayer(time, layerId);
    this.movieUpdated.next(this.movie);
  }

  moveLayers(time: number, previousIndex: number, newIndex: number) {
    if (!this.movie) return;

    this.movie.moveLayers(time, previousIndex, newIndex);
    this.movieUpdated.next(this.movie);
  }
}
