import { Component } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { Video } from '../../models/video';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../_shared/confirmation-dialog/confirmation-dialog.component';
import { take } from 'rxjs';
import moment from 'moment';

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

  downloadVideo(video: Video): void {
    let link = document.createElement("a");
    link.download = video.name ? video.name : moment(video.createdOn).format('DD-MM-YY hh:ss');
    link.href = URL.createObjectURL(video.blob);
    link.click();
  }
}
