import { Component } from '@angular/core';
import { MemberService } from './services/member.service';
import { MovieService } from './services/movie.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ILayer } from './interfaces/movie-layer';
import { TimelineService } from './services/timeline.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'StoryPlanner';

  constructor(public memberService: MemberService, public movieService: MovieService, public timelineService: TimelineService){}

  handleTabChange(event: MatTabChangeEvent) {
    this.movieService.resetSelectedLayer();
  }

  saveLayer(updatedLayer: ILayer): void {
    this.movieService.resetSelectedLayer();
    this.movieService.updateLayer(this.timelineService.currentTime.value, updatedLayer);
  }
}
