import { Component, OnDestroy, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { TimelineService } from '../../services/timeline.service';
import { ComponentBase } from '../../base/component-base';
import { takeUntil } from 'rxjs';
import { ILayer } from '../../interfaces/movie-layer';

@Component({
  selector: 'app-movie-control',
  templateUrl: './movie-control.component.html',
  styleUrl: './movie-control.component.scss'
})
export class MovieControlComponent extends ComponentBase implements OnInit, OnDestroy {

  currentTime: number = 0;

  constructor(public movieService: MovieService, private timelineService: TimelineService) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.currentTime
    .pipe(takeUntil(this.isComponentActive))
    .subscribe({
      next: time => this.currentTime = time
    });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  compareSelectedLayer(layer: ILayer): boolean {
    return layer.layerId === this.selectedLayer?.['layerId'];
  }

  handleLayerClick(layer: ILayer): void {
    if (!this.compareSelectedLayer(layer)) {
      this.selectLayer(layer)
    } else {
      this.resetSelectedRecord();
    }
  }
}
