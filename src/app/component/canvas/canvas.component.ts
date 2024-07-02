import { Component, OnDestroy, OnInit } from '@angular/core';
import { extend } from 'lodash';
import { ComponentBase } from '../../base/component-base';
import { TimelineService } from '../../services/timeline.service';
import { takeUntil } from 'rxjs';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent extends ComponentBase implements OnInit, OnDestroy {

  currentTime = 0;

  constructor(private timelineService: TimelineService, public movieService: MovieService) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.currentTime
    .pipe(takeUntil(this.isComponentActive))
    .subscribe({
      next: currentTime => this.currentTime = currentTime
    });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }
}
