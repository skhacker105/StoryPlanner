import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ComponentBase } from '../../base/component-base';
import { TimelineService } from '../../services/timeline.service';
import { takeUntil } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { ILayer } from '../../interfaces/movie-layer';
import { MemberService } from '../../services/member.service';
import { StyleService } from '../../services/style.service';
import { RecordingService } from '../../services/recording.service';

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

  constructor(
    private timelineService: TimelineService,
    public movieService: MovieService,
    private memberService: MemberService,
    private styleService: StyleService,
    private renderer: Renderer2,
    public recordingService: RecordingService) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.currentTime
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: currentTime => {
          const goingBack = this.currentTime > currentTime;
          this.updatePrintedLayer(this.movieService.movie?.timeline[currentTime]?.layers ? this.movieService.movie.timeline[currentTime].layers : [], goingBack);
          this.currentTime = currentTime
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

    // this.timelineService.recording
    //   .pipe(takeUntil(this.isComponentActive))
    //   .subscribe({
    //     next: recording => recording ? this.startrecording() : this.stopRecording()
    //   });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  convertLayersById(layers: ILayer[]): ILayersById {
    return layers.reduce((ob: ILayersById, layer: ILayer) => {
      ob[layer.layerId] = layer;
      return ob;
    }, {} as ILayersById);
  }

  updatePrintedLayer(sourceLayers: ILayer[], goingBack: boolean = false): void {
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
  }
}
