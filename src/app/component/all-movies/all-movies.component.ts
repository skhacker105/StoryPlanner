import { Component } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { Video } from '../../models/video';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../_shared/confirmation-dialog/confirmation-dialog.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-all-movies',
  templateUrl: './all-movies.component.html',
  styleUrl: './all-movies.component.scss'
})
export class AllMoviesComponent {

  constructor(public movieService: MovieService, private dialog: MatDialog) {}

  handleVideoClick(video: Video): void {
    this.movieService.playVideo.next(video);
  }

  handleDeleteVideo(video: Video): void {
    const ref = this.dialog.open(ConfirmationDialogComponent);
    ref.afterClosed()
    .pipe(take(1))
    .subscribe({
      next: result => result ? this.movieService.deleteVideo(video.id) : null
    });
  }
}
