import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { cloneDeep, extend } from 'lodash';
import { ComponentBase } from '../../base/component-base';
import { TimelineService } from '../../services/timeline.service';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { ILayer } from '../../interfaces/movie-layer';
import { MemberService } from '../../services/member.service';
import { StyleService } from '../../services/style.service';
import html2canvas from 'html2canvas';
import { FileService } from '../../services/file.service';

interface ILayersById { [key: string]: ILayer }

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent extends ComponentBase implements OnInit, OnDestroy {

  currentTime = 0;
  paintedLayers: ILayer[] = [];
  recordedFrames: HTMLCanvasElement[] = [];
  demoVideo: string[] = [];

  constructor(
    private timelineService: TimelineService,
    public movieService: MovieService,
    private memberService: MemberService,
    private styleService: StyleService,
    private renderer: Renderer2,
    private fileService: FileService) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.currentTime
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: currentTime => {
          const goingBack = this.currentTime > currentTime;
          let layers = this.movieService.movie?.timeline[currentTime]?.layers
            ? this.movieService.movie.timeline[currentTime].layers
            : [];

          let continueToCollect = false;
          if (this.timelineService.recording.value) {
            continueToCollect = true;
            layers = this.updateAnimationDurationForRecording(layers);
          }

          this.updatePrintedLayer(layers, goingBack, continueToCollect);
          this.currentTime = currentTime;
        }
      });
    this.movieService.movieUpdated
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: movie => {
          this.paintedLayers = [];
          setTimeout(() => {
            this.updatePrintedLayer(this.movieService.movie?.timeline[this.currentTime]?.layers ? this.movieService.movie.timeline[this.currentTime].layers : []);
          }, 1);
        }
      });
    this.memberService.members
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: members => {
          this.paintedLayers = [];
          setTimeout(() => {
            this.updatePrintedLayer(this.movieService.movie?.timeline[this.currentTime]?.layers ? this.movieService.movie.timeline[this.currentTime].layers : []);
          }, 1);
        }
      });

    this.timelineService.playingStateChange
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: playing => this.paintedLayers = playing ? cloneDeep(this.paintedLayers) : this.paintedLayers
      });

    this.timelineService.recording
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: recording => {
          if (recording) {
            const updatedLayers = this.updateAnimationDurationForRecording(this.paintedLayers);
            this.updatePrintedLayer(updatedLayers, false, false);
            this.startrecording();
          } else {
            this.stopRecording();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  updateAnimationDurationForRecording(layers: ILayer[]): ILayer[] {
    if (!this.timelineService.recording.value) return layers;

    const newLayers = cloneDeep(layers);
    newLayers.forEach(l => l.animation ? l.animation.duration = l.animation.duration * 10 : null)
    return newLayers;
  }

  convertLayersById(layers: ILayer[]): ILayersById {
    return layers.reduce((ob: ILayersById, layer: ILayer) => {
      ob[layer.layerId] = layer;
      return ob;
    }, {} as ILayersById);
  }

  updatePrintedLayer(sourceLayers: ILayer[], goingBack: boolean = false, continueToCollect: boolean = false): void {
    if (goingBack) {
      this.paintedLayers = cloneDeep(sourceLayers);
      return;
    }
    const objSource = this.convertLayersById(sourceLayers);
    const objPaintedLayers = this.convertLayersById(this.paintedLayers);

    const layersToAdd = sourceLayers.filter(sl =>
      !sl.isProjected || !objPaintedLayers[sl.layerId]
        ? true : false
    );
    const layersToUpdate = this.paintedLayers.filter(l =>
      objSource[l.layerId] && objSource[l.layerId].isProjected
        ? true : false
    );
    const layersToDelete = this.paintedLayers.filter(l =>
      !objSource[l.layerId] || !objSource[l.layerId].isProjected
        ? true : false
    );

    const animationStr = layersToAdd.reduce((str: string, l) => str + this.styleService.getAnimationFrameString(l), '')
    const styleEl = this.renderer.createElement('style');
    styleEl.appendChild(this.renderer.createText(animationStr));
    this.renderer.appendChild(document.head, styleEl);


    this.paintedLayers = [...layersToUpdate, ...layersToAdd];
    if (continueToCollect) this.collectTillRecording();
  }

  startrecording(): void {
    this.recordedFrames = [];
    this.timelineService.setMaxPlayTime(this.movieService.maxPlayTime);
    // this.paintedLayers = [...this.paintedLayers];
    this.collectTillRecording();
  }

  collectTillRecording(): void {
    const framesPerUnitTime$ = this.getFramesPerUnitTime(this.timelineService.framesPerUnitTime);
    framesPerUnitTime$
      .pipe(take(1))
      .subscribe({
        next: recordedFrames => {
          this.recordedFrames = [...this.recordedFrames, ...recordedFrames];
          if (this.timelineService.hasNextTime() && this.timelineService.recording.value) {
            this.timelineService.increaseTime();
          } else this.timelineService.stopRecording();
        }
      });
  }

  getFramesPerUnitTime(frameCount: number): Subject<HTMLCanvasElement[]> {
    const recordedFrames: HTMLCanvasElement[] = [];
    const recordedFrames$ = new Subject<HTMLCanvasElement[]>();
    const collectAll = () => {
      this.getCurrentFrame()
        ?.pipe(take(1))
        ?.subscribe({
          next: frame => {
            frame ? recordedFrames.push(frame) : null;
            if (recordedFrames.length < frameCount && this.timelineService.recording.value) {
              setTimeout(() => {
                collectAll();
              }, (this.timelineService.standardSpeed * 10) / frameCount);
            } else {
              recordedFrames$.next(recordedFrames);
            }
          }
        })
    }

    collectAll();
    return recordedFrames$;
  }

  getCurrentFrame(): Observable<HTMLCanvasElement | null> | undefined {
    const divElement = document.getElementById('canvas-container'); // Replace with your div's ID
    if (!divElement) return;

    return new Observable(observer => {
      html2canvas(divElement)
        .then(canvas => observer.next(canvas))
        .catch(err => observer.error(err));
    });
  }

  stopRecording(): void {
    if (this.recordedFrames.length > 0) {
      this.saveCanvasAsVideo(this.recordedFrames)
    }
  }

  saveCanvasAsVideo(canvases: HTMLCanvasElement[]) {
    this.demoVideo = canvases.map(c => c.toDataURL("image/png"))
    // this.fileService.convertImageURLsToVideo(this.demoVideo);

    // this.fileService.generateVideo1(canvases);
    const promises = canvases.map(c => new Promise<Blob | null>(resolve => c.toBlob(blob => resolve(blob))));
    if (promises && promises.length > 0) {
      Promise.all(promises).then(arrBlob => {
        const arrNonUllBlobs: Blob[] = [];
        arrBlob.map(b => b ? arrNonUllBlobs.push(b) : false);
        this.fileService.generateVideo(arrNonUllBlobs, (this.timelineService.standardSpeed / this.timelineService.framesPerUnitTime))
      });
    }
  }
}
