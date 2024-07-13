import { Injectable, OnDestroy } from '@angular/core';
import { UtilService } from './util.service';
import { MemberService } from './member.service';
import { IMovie } from '../interfaces/timeline-movie';
import { BehaviorSubject, Subject, take, takeUntil } from 'rxjs';
import { IMemberStorage } from '../interfaces/member-storage';
import { Movie } from '../models/movie';
import { ILayer } from '../interfaces/movie-layer';
import { ServiceBase } from '../base/service-base';
import { IMemberBookDictionary, IMemberOptionDictionary } from '../interfaces/member-dictionary';
import { Member } from '../models/members';
import { IMemberOption } from '../interfaces/member';
import { createLayerWithDefaultProperties } from '../models/layer';
import { ILayerProperties } from '../interfaces/movie-properties';
import { ILayerAnimation } from '../interfaces/movie-animations';
import { Video } from '../models/video';
import { FileService } from './file.service';
import { IndexedDBManager } from '../storage/indexedDB.manager';
import { Tables } from '../constants/constant';

@Injectable({
  providedIn: 'root'
})
export class MovieService extends ServiceBase implements OnDestroy {

  movieLocalStorageKey = 'movie';

  movie?: Movie;
  movieUpdated = new Subject<IMovie>();
  dictionaryMemberBook: IMemberBookDictionary = {};
  movieStorageManager = new IndexedDBManager<IMovie>(Tables.MovieStorage, 'id');

  allVideos: Video[] = [];
  playVideo = new BehaviorSubject<Video | undefined>(undefined);
  selectedVideoId = new BehaviorSubject<string | undefined>(undefined);
  videoStorageManager = new IndexedDBManager<Video>(Tables.VideoListStorage, 'id');

  public selectedLayer?: ILayer;
  public selectedLayerTime?: number;

  constructor(private utilService: UtilService, private memberService: MemberService, private fileServie: FileService) {
    super();

    this.movieUpdated
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: movie => this.saveMovieToStorage(movie)
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

    this.fileServie.newVideo
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: newVideo => this.addNewVideo(newVideo)
      })


    this.loadVideosFromStorage();
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
    } as IMovie);
    this.movieUpdated.next(this.movie);
    this.movieStorageManager.add(this.movie);
  }

  loadVideosFromStorage() {
    this.videoStorageManager.getAll()
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: videos => this.allVideos = videos
      });
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
            this.movie = new Movie(storedMovie);
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

    const newLayer: ILayer = createLayerWithDefaultProperties(this.utilService.generateNewId(), time, id, memberOptionId);
    this.movie.addMemberOptionToTime(time, id, memberOptionId, newLayer);
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

  public updateAnimation(time: number, layerId: string, newAnimation: ILayerAnimation | undefined): void {
    if (!this.movie) return;

    this.movie.updateAnimation(time, layerId, newAnimation);
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

  addNewVideo(video: Video): void {
    this.allVideos.push(video);
    this.videoStorageManager.add(video);
  }

  deleteVideo(videoId: string) {
    this.videoStorageManager.delete(videoId);
    this.loadVideosFromStorage();
  }

  selectVideo(videoId: string): void {
    this.selectedVideoId.next(videoId);
  }

  resetSelectedVideo(): void {
    this.selectedVideoId.next(undefined);
  }
}
