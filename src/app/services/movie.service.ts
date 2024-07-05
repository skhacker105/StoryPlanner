import { Injectable, OnDestroy } from '@angular/core';
import { UtilService } from './util.service';
import { MemberService } from './member.service';
import { IMovie } from '../interfaces/timeline-movie';
import { Subject, takeUntil } from 'rxjs';
import { IMemberStorage } from '../interfaces/member-storage';
import { Movie } from '../models/movie';
import { ILayer } from '../interfaces/movie-layer';
import { ServiceBase } from '../base/service-base';
import { IMemberBookDictionary, IMemberOptionDictionary } from '../interfaces/member-dictionary';
import { Member } from '../models/members';
import { IMemberOption } from '../interfaces/member';
import { createLayerWithDefaultProperties } from '../models/layer';
import { ILayerProperties } from '../interfaces/movie-properties';

@Injectable({
  providedIn: 'root'
})
export class MovieService extends ServiceBase implements OnDestroy {

  movieLocalStorageKey = 'movie';

  movie?: Movie;
  movieUpdated = new Subject<IMovie>();
  dictionaryMemberBook: IMemberBookDictionary = {};

  public selectedLayer?: ILayer;
  public selectedLayerTime?: number;

  constructor(private utilService: UtilService, private memberService: MemberService) {
    super();

    this.movieUpdated
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: movie => this.saveMovieToLocalStorage(movie)
      });

    this.memberService.members
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: members => this.dictionaryMemberBook = this.getMemberOptionDictionary(members)
      });

    this.memberService.memberStorageUpdated
      .pipe(takeUntil(this.isServiceActive))
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

  get maxPlayTime(): number {
    if (!this.movie) return -1;

    let maxTime: number = -1;
    const timelineKeys = Object.keys(this.movie.timeline);
    for (let i = timelineKeys.length - 1; i >= 0; i--) {
      if (this.movie.timeline[+timelineKeys[i]].layers.length > 0) {
        maxTime = +timelineKeys[i];
        break;
      }
    }
    return maxTime;
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  getMemberOptionDictionary(members: Member[]): IMemberBookDictionary {
    return members.reduce(
      (objMember: IMemberBookDictionary, member: Member) => {

        if (!objMember[member.memberId]) objMember[member.memberId] = { member, options: {} }

        member.options.reduce(
          (objOption: IMemberOptionDictionary, option: IMemberOption) => {

            if (!objOption[option.optionId]) objOption[option.optionId] = option;
            return objOption;
          },
          objMember[member.memberId].options)
        return objMember;
      },
      {} as IMemberBookDictionary)
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

    const newLayer: ILayer = createLayerWithDefaultProperties(this.utilService.generateNewId(), time, memberId, memberOptionId);
    this.movie.addMemberOptionToTime(time, memberId, memberOptionId, newLayer);
    this.movieUpdated.next(this.movie);
  }

  updateLayer(time: number, newLayer: ILayer): void {
    if (!this.movie) return;

    this.movie.updateLayer(time, newLayer);
    this.movieUpdated.next(this.movie);
  }

  updateProperties(time: number, layerId: string, newProperties: ILayerProperties): void {
    if (!this.movie) return;

    this.movie.updateProperties(time, layerId, newProperties);
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

  resetSelectedLayer(): void {
    this.selectedLayer = undefined;
    this.selectedLayerTime = undefined;
  }

  selectLayer(time: number, layer: ILayer): void {
    this.resetSelectedLayer();

    this.selectedLayerTime = time;
    setTimeout(() => {
      this.selectedLayer = layer;
    }, 1);
  }
}
