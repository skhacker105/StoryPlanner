import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { TimelineService } from '../../services/timeline.service';
import { ComponentBase } from '../../base/component-base';
import { take, takeUntil } from 'rxjs';
import { ILayer } from '../../interfaces/movie-layer';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../_shared/confirmation-dialog/confirmation-dialog.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';



@Component({
  selector: 'app-layer-control',
  templateUrl: './layer-control.component.html',
  styleUrl: './layer-control.component.scss'
})
export class LayerControlComponent extends ComponentBase implements OnInit, OnDestroy {

  readonly dialog = inject(MatDialog);

  currentTime: number = 0;

  constructor(public movieService: MovieService, public timelineService: TimelineService) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.currentTime
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: time => {
          if (this.currentTime !== time) {
            this.currentTime = time;
            this.movieService.resetSelectedLayer();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  compareSelectedLayer(layer: ILayer): boolean {
    return layer.layerId === this.movieService.selectedLayer?.['layerId'];
  }

  handleLayerClick(layer: ILayer): void {
    if (!this.compareSelectedLayer(layer)) {
      this.movieService.selectLayer(this.timelineService.currentTime.value, layer);
    } else {
      this.movieService.resetSelectedLayer();
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

  drop(event: CdkDragDrop<string[]>): void {
    if (!this.movieService.movie) return;
    this.movieService.moveLayers(this.timelineService.currentTime.value, event.previousIndex, event.currentIndex);
  }

  gotoProjectionStart(layer: ILayer): void {
    if (!layer.isProjected || !this.movieService.movie) return;

    this.timelineService.setNewTime(layer.projectionStartTime);
    const projectionStartLayerRef = this.movieService.movie.timeline[layer.projectionStartTime].layers.find(l => l.layerId === layer.layerId);
    if (projectionStartLayerRef) this.movieService.selectLayer(this.timelineService.currentTime.value, projectionStartLayerRef)
  }
}
