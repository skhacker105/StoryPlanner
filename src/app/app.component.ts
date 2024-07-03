import { Component } from '@angular/core';
import { MemberService } from './services/member.service';
import { MovieService } from './services/movie.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ILayer } from './interfaces/movie-layer';
import { TimelineService } from './services/timeline.service';
import { Member } from './models/members';
import { IMemberOption } from './interfaces/member';

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
    this.memberService.resetSelectedRecord();
  }

  saveLayer(updatedLayer: ILayer): void {
    this.movieService.updateLayer(this.timelineService.currentTime.value, updatedLayer);
  }

  addOptionToMovieTimeLine(member: Member, option: IMemberOption) {
    this.movieService.addMemberOptionToTime(this.timelineService.currentTime.value, member.memberId, option.optionId);
  }
}
