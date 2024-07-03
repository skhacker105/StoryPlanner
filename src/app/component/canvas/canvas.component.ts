import { Component, OnDestroy, OnInit } from '@angular/core';
import { extend } from 'lodash';
import { ComponentBase } from '../../base/component-base';
import { TimelineService } from '../../services/timeline.service';
import { takeUntil } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { ILayer } from '../../interfaces/movie-layer';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent extends ComponentBase implements OnInit, OnDestroy {

  currentTime = 0;
  paintedLayers: ILayer[] = [];

  constructor(private timelineService: TimelineService, public movieService: MovieService) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.currentTime
    .pipe(takeUntil(this.isComponentActive))
    .subscribe({
      next: currentTime => {
        console.log('layers = ', this.movieService.movie?.timeline[currentTime].layers);
        this.paintedLayers = this.movieService.movie ? this.movieService.movie.timeline[currentTime].layers : [];
        this.currentTime = currentTime
      }
    });
    this.movieService.movieUpdated
    .pipe(takeUntil(this.isComponentActive))
    .subscribe({
      next: movie => {
        console.log('layers = ', this.movieService.movie?.timeline[this.currentTime].layers);
        this.paintedLayers = [];
        setTimeout(() => {
          this.paintedLayers = this.movieService.movie ? this.movieService.movie.timeline[this.currentTime].layers : [];
        }, 1);
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }
}
