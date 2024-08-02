import { Injectable, OnDestroy } from '@angular/core';
import { UtilService } from './util.service';
import { MemberService } from './member.service';
import { IMovie, IMovieTimeLayer } from '../interfaces/timeline-movie';
import { Subject, take, takeUntil } from 'rxjs';
import { Movie } from '../models/movie';
import { ILayer, ILayerRepeat } from '../interfaces/movie-layer';
import { ServiceBase } from '../base/service-base';
import { IMemberBookDictionary, IMemberOptionDictionary } from '../interfaces/member-dictionary';
import { Member } from '../models/members';
import { IMemberOption } from '../interfaces/member';
import { CreateLayerWithDefaultProperties } from '../models/layer';
import { ILayerProperties } from '../interfaces/movie-properties';
import { ILayerAnimation } from '../interfaces/movie-animations';
import { IndexedDBManager } from '../storage/indexedDB.manager';
import { Tables } from '../constants/constant';
import { TimelineService } from './timeline.service';

@Injectable({
  providedIn: 'root'
})
export class MovieService extends ServiceBase implements OnDestroy {

  movieLocalStorageKey = 'movie';

  movie?: Movie;
  movieUpdated = new Subject<IMovie>();
  dictionaryMemberBook: IMemberBookDictionary = {};
  movieStorageManager = new IndexedDBManager<IMovie>(Tables.MovieStorage, 'id');

  public selectedLayer?: ILayer;
  public selectedLayerTime?: number;
  public selectedLayerMember?: Member;
  public selectedLayerOption?: IMemberOption;
  public selectedLayerTimeUnits: IMovieTimeLayer = {};

  constructor(private utilService: UtilService, public memberService: MemberService, private timelineService: TimelineService) {
    super();

    this.movieUpdated
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: movie => {
          this.saveMovieToStorage(movie);
          this.timelineService.setMaxPlayTime(this.maxPlayTime);
          if (this.selectedLayer)
            this.selectedLayerTimeUnits = this.findTimeUnitsByLayer(this.selectedLayer);
        }
      });

    this.memberService.members
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: members => {
          if (members.length === 0) return;
          this.dictionaryMemberBook = this.getMemberOptionDictionary(members);
          if (!this.movie) this.loadMovieFromStorage();
        }
      });

    // Code to delete layers from Indexed DB
    // setTimeout(() => {
    //   console.log('this.movie = ',this.movie)
    //   if (!this.movie) return;

    //   Object.keys(this.movie.timeline).forEach(t => {
    //     if (!this.movie) return;
    //     this.movie.timeline[+t].layers = this.movie.timeline[+t].layers.filter(l => !l.repeating);
    //     if (this.movie.timeline[+t].layers.length === 0) delete this.movie.timeline[+t]
    //   });
    //   console.log('this.movie = ',this.movie)
    //   this.movieStorageManager.update(this.movie);
    // }, 1000);
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
    const dict = members.reduce(
      (objMember: IMemberBookDictionary, member: Member) => {

        if (!objMember[member.id]) objMember[member.id] = { member, options: {} }

        member.options.reduce(
          (objOption: IMemberOptionDictionary, option: IMemberOption) => {

            if (!objOption[option.optionId]) objOption[option.optionId] = option;
            return objOption;
          },
          objMember[member.id].options)
        return objMember;
      },
      {} as IMemberBookDictionary)
    return dict;
  }

  createDefaultMovie(): void {
    this.movie = new Movie({
      id: this.utilService.generateNewId(),
      memberBook: {
        name: '',
        version: ''
      },
      movieName: 'MyMovie',
      timeline: {},
      version: {
        primary: 0,
        major: 0,
        minor: 1
      }
    } as IMovie, this.utilService);
    this.movieUpdated.next(this.movie);
    this.movieStorageManager.add(this.movie);
  }

  loadMovieFromStorage(): void {
    this.movieStorageManager.getAll()
      .pipe(take(1))
      .subscribe({
        next: savedMovies => {
          if (savedMovies.length === 0) this.createDefaultMovie();
          else {
            const storedMovie = savedMovies[0];
            // if (storedMovie.memberBook.name !== memberBook.name || storedMovie.memberBook.version !== memberBook.version) {
            //   console.log('Locally saved movie do not matches with your locally saved Book')
            // } else {
            this.movie = new Movie(storedMovie, this.utilService);
            this.movieUpdated.next(this.movie);
            // }
          }
        }
      });
  }

  saveMovieToStorage(movie: IMovie): void {
    this.movieStorageManager.update(movie);
  }

  addMemberOptionToTime(time: number, id: string, memberOptionId: string): void {
    if (!this.movie) {
      console.log('No movie to add layer');
      return;
    }

    const newLayer: ILayer = CreateLayerWithDefaultProperties(this.utilService.generateNewId(), time, id, memberOptionId);
    this.movie.addMemberOptionToTime(time, id, memberOptionId, newLayer);
    this.movieUpdated.next(this.movie);
  }

  updateProperties(time: number, layerId: string, newProperties: ILayerProperties): void {
    if (!this.movie) return;

    this.movie.updateProperties(time, layerId, newProperties);
    this.movieUpdated.next(this.movie);
  }

  updateAnimation(time: number, layerId: string, newAnimation: ILayerAnimation | undefined): void {
    if (!this.movie) return;

    this.movie.updateAnimation(time, layerId, newAnimation);
    this.movieUpdated.next(this.movie);
  }

  updateRepeat(time: number, layerId: string, newRepeating: ILayerRepeat | undefined): void {
    if (!this.movie) return;

    this.movie.updateRepeat(time, layerId, newRepeating)
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

  compareSelectedLayer(layer: ILayer): boolean {
    return layer.layerId === this.selectedLayer?.layerId;
  }

  resetSelectedLayer(): void {
    this.selectedLayer = undefined;
    this.selectedLayerTime = undefined;
    this.selectedLayerMember = undefined;
    this.selectedLayerOption = undefined;
    this.selectedLayerTimeUnits = {};
  }

  selectLayer(time: number, layer: ILayer): void {

    if (!this.compareSelectedLayer(layer)) {
      this.resetSelectedLayer();
      this.selectedLayerTime = time;
      setTimeout(() => {
        this.selectedLayer = layer;
        const dict = this.dictionaryMemberBook[layer.memberId];
        this.selectedLayerMember = dict?.member;
        this.selectedLayerOption = dict?.options[layer.memberOptionId]
        this.selectedLayerTimeUnits = this.findTimeUnitsByLayer(layer);
      }, 1);

    } else {
      this.resetSelectedLayer();
    }
  }

  findTimeUnitsByLayer(layer: ILayer): IMovieTimeLayer {
    if (!this.movie) return [];

    const arr: IMovieTimeLayer = {};
    for (let i = 0; i <= this.maxPlayTime; i++) {
      const foundLayer: ILayer | undefined = this.movie.timeline[i].layers.find(l => l.layerId === layer.layerId || l.repeating?.layerId === layer.layerId || layer.repeating?.layerId === l.layerId);
      if (foundLayer) arr[i] = {
        layer: foundLayer,
        isProjected: foundLayer.isProjected,
        isRepeated: foundLayer.repeating && foundLayer.repeating.repeatingStartTime !== i ? true : false
      };
    }
    return arr;
  }

  isTimeInSelectedLayerUnits(time: number): boolean {
    return this.selectedLayerTimeUnits[time] !== undefined;
  }

  moveLayerToTime(time: number, layerId: string, newTime: number): void {
    if (!this.movie) return;

    this.movie.moveLayerToTime(time, layerId, newTime);
    this.movieUpdated.next(this.movie);
    this.timelineService.setNewTime(newTime);
  }
}
