import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { TimelineService } from '../../services/timeline.service';
import { ComponentBase } from '../../base/component-base';
import { take, takeUntil } from 'rxjs';
import { ILayer } from '../../interfaces/movie-layer';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-movie-control',
  templateUrl: './movie-control.component.html',
  styleUrl: './movie-control.component.scss'
})
export class MovieControlComponent extends ComponentBase implements OnInit, OnDestroy {

  readonly dialog = inject(MatDialog);

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
      this.resetSelectedLayer();
    }
  }

  handleDeleteConfirmationPopup(layer: ILayer): void {
    const ref = this.dialog.open(ConfirmationDialogComponent);
    ref.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: result => result ? this.handleDeleteLayer(layer) : null
      });
  }

  handleDeleteLayer(layer: ILayer): void {
    this.movieService.removeLayer(this.timelineService.currentTime.value, layer.layerId);
  }
}
