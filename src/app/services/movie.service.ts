import { Injectable, OnDestroy } from '@angular/core';
import { UtilService } from './util.service';
import { MemberService } from './member.service';
import { IMovie, IMovieTimeLayer } from '../interfaces/timeline-movie';
import { filter, Subject, take, takeUntil } from 'rxjs';
import { Movie } from '../models/movie';
import { ILayer } from '../interfaces/movie-layer';
import { ServiceBase } from '../base/service-base';
import { IMemberBookDictionary, IMemberOptionDictionary } from '../interfaces/member-dictionary';
import { Member } from '../models/members';
import { IMember, IMemberOption } from '../interfaces/member';
import { ConvertToLayerAudio, CreateLayerWithDefaultProperties } from '../models/layer';
import { ILayerProperties } from '../interfaces/movie-properties';
import { ILayerAnimation } from '../interfaces/movie-animations';
import { IndexedDBManager } from '../storage/indexedDB.manager';
import { Tables } from '../constants/constant';
import { TimelineService } from './timeline.service';
import { DisplayService } from './display.service';
import { ILayerRepeat } from '../interfaces/movie-layer-repeat';
import { IlayerMedia } from '../interfaces/movie-media';
import { MemberBookDictionary } from '../models/member-dictionary';
import { ILayerAudio } from '../interfaces/movie-audios';

@Injectable({
  providedIn: 'root'
})
export class MovieService extends ServiceBase implements OnDestroy {

  movieLocalStorageKey = 'movie';

  movie?: Movie;
  movieUpdated = new Subject<IMovie>();
  dictionaryMemberBook: MemberBookDictionary | undefined;
  movieStorageManager = new IndexedDBManager<IMovie>(Tables.MovieStorage, 'id');

  public selectedLayer?: ILayer;
  public selectedLayerTime?: number;
  public selectedLayerMember?: Member;
  public selectedLayerOption?: IMemberOption;
  public selectedLayerTimeUnits: IMovieTimeLayer = {};

  constructor(
    private utilService: UtilService,
    public memberService: MemberService,
    private timelineService: TimelineService,
    private displayService: DisplayService) {
    super();

    this.movieUpdated
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: movie => {
          this.saveMovieToStorage(movie);
          this.timelineService.setMaxPlayTime(this.maxPlayTime);
          if (this.selectedLayer) {
            const selectedLayerId = this.selectedLayer.layerId;
            this.resetSelectedLayer();
            const selectedLayer = this.movie?.timeline[this.timelineService.currentTime.value].layers.find(l => l.layerId === selectedLayerId)
            if (selectedLayer)
              this.selectLayer(this.timelineService.currentTime.value, selectedLayer)
          }
        }
      });

    this.memberService.members
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: members => {
          if (members.length === 0) return;
          this.updateMemberOptionDictionary(members);
          if (!this.movie) this.loadMovieFromStorage();
        }
      });

    this.displayService.dialogOpened
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: () => this.resetSelectedLayer()
      });

    this.timelineService.movieAudioLayers
      .pipe(filter(request => request.state === 'requested'), takeUntil(this.isServiceActive))
      .subscribe({
        next: () => this.prepareAudioFileForAllTimes()
      });

    // Code to delete layers from Indexed DB
    // setTimeout(() => {
    //   console.log('this.movie = ',this.movie)
    //   if (!this.movie) return;

    //   Object.keys(this.movie.timeline).forEach(t => {
    //     if (!this.movie) return;
    //     this.movie.timeline[+t].layers.forEach(l => {
    //       l.
    //     });
    //     // this.movie.timeline[+t].layers = this.movie.timeline[+t].layers.filter(l => !l.repeating);
    //     // if (this.movie.timeline[+t].layers.length === 0) delete this.movie.timeline[+t]
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

  updateMemberOptionDictionary(members: Member[]): void {
    if (this.dictionaryMemberBook) delete this.dictionaryMemberBook;

    this.dictionaryMemberBook = new MemberBookDictionary(members);
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

  addMemberToCurrentTimeLayer(time: number, member: IMember, memberOption: IMemberOption): void {
    if (!this.movie) {
      console.log('No movie to add layer');
      return;
    }

    const newLayer: ILayer = CreateLayerWithDefaultProperties(this.utilService.generateNewId(), time, member.id, memberOption, this.timelineService.timeMultiplier);
    this.movie.addNewLayer(time, newLayer);
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

    this.movie.updateRepeat(time, layerId, newRepeating);
    this.movieUpdated.next(this.movie);
  }

  updateMedia(time: number, layerId: string, media: IlayerMedia | undefined): void {
    if (!this.movie) return;

    this.movie.updateMedia(time, layerId, media, this.timelineService.timeMultiplier);
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
        const dict = this.dictionaryMemberBook?.getLayer(layer);
        this.selectedLayerMember = dict?.member;
        this.selectedLayerOption = dict?.options[layer.memberOptionId];
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

  async prepareAudioFileForAllTimes() {
    if (!this.movie) return;

    let timeLayers: ILayer[] = [];
    let arrAudios: ILayerAudio[] = [];

    for (let time = 0; time <= this.timelineService.maxPlayTime; time++) {
      const movieTime = this.movie.timeline[time];
      const { layersToAdd, layersToUpdate } = this.utilService.categorizeLayers(movieTime.layers, timeLayers);

      const videoLayers = layersToAdd.filter(layer => this.dictionaryMemberBook?.getOption(layer).type === 'video');
      const audioLayers = layersToAdd.filter(layer => this.dictionaryMemberBook?.getOption(layer).type === 'audio');

      arrAudios = [...arrAudios, ...(await this.prepareAudioOptions(audioLayers, time))];
      timeLayers = [...layersToAdd, ...layersToUpdate];
    }
    this.timelineService.movieAudioLayers.next({ state: 'ready', audioLayers: arrAudios });
  }

  async prepareAudioOptions(audioLayers: ILayer[], time: number) {
    const newAudios: ILayerAudio[] = [];
    for (let audioLayer of audioLayers) {
      const option = this.dictionaryMemberBook?.getOption(audioLayer)

      if (option && audioLayer.media) {
        const slicedAudioFile = await this.utilService.extractAudioPart(option.file, audioLayer.media.startTime, audioLayer.media.endTime)
        newAudios.push(ConvertToLayerAudio(time, audioLayer, option, slicedAudioFile, this.timelineService.timeMultiplier));
      }
    }
    return newAudios;
  }
}
