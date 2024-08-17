import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ComponentBase } from '../../base/component-base';
import { TimelineService } from '../../services/timeline.service';
import { debounceTime, filter, merge, takeUntil } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { ILayer } from '../../interfaces/movie-layer';
import { MemberService } from '../../services/member.service';
import { StyleService } from '../../services/style.service';
import { RecordingService } from '../../services/recording.service';
import { FileService } from '../../services/file.service';
import { Video } from '../../models/video';
import { UtilService } from '../../services/util.service';
import { IMemberOption } from '../../interfaces/member';
import { ILayerAudio } from '../../interfaces/movie-audios';

interface ImemberOptionAudio extends Omit<IMemberOption, 'file'> {
  file: AudioBuffer | string;
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent extends ComponentBase implements OnInit, OnDestroy {

  currentTime = 0;
  videoURLToPlay: string | undefined;
  paintedLayers: ILayer[] = [];
  audioLayers: ILayerAudio[] = [];

  constructor(
    public timelineService: TimelineService,
    public movieService: MovieService,
    private memberService: MemberService,
    private styleService: StyleService,
    private renderer: Renderer2,
    public recordingService: RecordingService,
    public fileService: FileService,
    private utilService: UtilService) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.currentTime
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: currentTime => {
          const goingBack = this.currentTime > currentTime;
          this.updateAudioLayersView();
          this.updatePrintedLayer(this.movieService.movie?.timeline[currentTime]?.layers ? this.movieService.movie.timeline[currentTime].layers : [], goingBack);
          this.currentTime = currentTime;
          this.autoPlayVideos();
        }
      });

    merge(this.movieService.movieUpdated, this.memberService.members)
      .pipe(debounceTime(100), takeUntil(this.isComponentActive))
      .subscribe({
        next: () => {
          this.paintedLayers = [];
          setTimeout(() => {
            this.updatePrintedLayer(this.movieService.movie?.timeline[this.currentTime]?.layers ? this.movieService.movie.timeline[this.currentTime].layers : []);
          }, 1);
        }
      });

    this.timelineService.movieAudioLayers
      .pipe(filter(request => request.state === 'ready', takeUntil(this.isComponentActive)))
      .subscribe({
        next: request => this.audioLayers = request.audioLayers ?? []
      });

    this.timelineService.playingStateChange
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: playing => {
          this.paintedLayers = playing ? cloneDeep(this.paintedLayers) : this.paintedLayers;
          this.autoPlayVideos();
        }
      });

    this.recordingService.playVideo
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: video => {
          video ? this.showMovie(video) : this.resetSelectedVideo();
        }
      });

    this.timelineService.currentFrameCount
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: () => this.updatedLayersAnimationState()
      });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  updatePrintedLayer(incomingLayers: ILayer[], goingBack: boolean = false): void {
    if (goingBack) {
      this.paintedLayers = cloneDeep(incomingLayers);
      return;
    }
    const { layersToAdd, layersToUpdate, layersToDelete } = this.utilService.categorizeLayers(incomingLayers, this.paintedLayers);

    this.pauseAllVideos(layersToDelete);
    this.renderAnimationForAddedLayers(layersToAdd);
    this.paintedLayers = [...layersToUpdate, ...layersToAdd];
  }

  renderAnimationForAddedLayers(layersToAdd: ILayer[]): void {
    const animationStr = layersToAdd.reduce((str: string, l) => str + this.styleService.getAnimationFrameString(l), '')
    const styleEl = this.renderer.createElement('style');
    styleEl.appendChild(this.renderer.createText(animationStr));
    this.renderer.appendChild(document.head, styleEl);
  }

  updatedLayersAnimationState(): void {
    setTimeout(() => {
      const currentTime = this.timelineService.currentTime.value;
      const currentFrameCount = this.timelineService.currentFrameCount.value;
      const framesPerUnitTime = this.timelineService.framesPerUnitTime.value;
      const standardSpeed = this.timelineService.standardSpeed.value;

      this.paintedLayers.forEach(layer => {
        const ob = document.getElementById(layer.layerId);
        const layerAnimations = ob?.getAnimations();
        if (!ob || !layerAnimations || layerAnimations.length === 0 || !layer.animation) return;

        const completedAnimation = ((currentTime - layer.projectionStartTime) * framesPerUnitTime) + currentFrameCount;
        const completedInMillisecond = (standardSpeed / framesPerUnitTime) * completedAnimation;
        const completedInMillisecondForCurrentIteration = completedInMillisecond % (layer.animation.duration * 1000);
        layerAnimations[0].currentTime = completedInMillisecondForCurrentIteration;
      });
    });
  }

  updateAudioLayersView(): void {
    const currentTime = this.currentTime;
    this.audioLayers.forEach(audioLayer => {
      const startTime = audioLayer.startTime;
      const endTime = audioLayer.endTime;

      if (startTime <= currentTime && currentTime <= endTime && !audioLayer.currentTimeInRange)
        audioLayer.currentTimeInRange = true;

      else if ((currentTime < startTime || endTime < currentTime) && audioLayer.currentTimeInRange)
        audioLayer.currentTimeInRange = false;

    });
  }

  pauseAllVideos(layersToDelete: ILayer[]): void {
    layersToDelete.forEach(layer => {
      if (this.movieService.dictionaryMemberBook?.getOption(layer).type === 'video') {
        const videoElement = document.getElementById(layer.layerId) as HTMLVideoElement;
        if (videoElement) {
          videoElement.pause();
          window.URL.revokeObjectURL(videoElement.src);
        }
      }
    });
  }

  autoPlayVideos(): void {
    this.paintedLayers.forEach(layer => {
      if (!layer.isProjected && this.movieService.dictionaryMemberBook?.getOption(layer).type === 'video') {
        const videoElement = document.getElementById(layer.layerId) as HTMLVideoElement;
        if (videoElement) {
          if (this.timelineService.playing) {
            videoElement.play();
            videoElement.currentTime = this.currentTime * this.timelineService.timeMultiplier;
          } else {
            videoElement.pause();
          }
        }
      }
    });
  }

  showMovie(video: Video): void {
    this.videoURLToPlay = URL.createObjectURL(video.blob);
  }

  hideMovie(): void {
    this.recordingService.resetSelectedVideo();
  }

  resetSelectedVideo(): void {
    this.videoURLToPlay = undefined;
  }

  handleLayerClick(layer: ILayer): void {
    this.movieService.selectLayer(this.timelineService.currentTime.value, layer);
  }
}
