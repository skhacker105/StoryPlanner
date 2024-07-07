import { Component, OnInit } from '@angular/core';
import { MemberService } from './services/member.service';
import { MovieService } from './services/movie.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TimelineService } from './services/timeline.service';
import { Member } from './models/members';
import { IMemberOption } from './interfaces/member';
import { ILayerProperties } from './interfaces/movie-properties';
import { ILayer } from './interfaces/movie-layer';
import { ILayerAnimation } from './interfaces/movie-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'StoryPlanner';
  selectedIndex = 0;

  constructor(public memberService: MemberService, public movieService: MovieService, public timelineService: TimelineService) { }

  ngOnInit(): void {
    setTimeout(() => {
      let layersFound = false;
      if (!this.movieService.movie) return;

      for(let time in this.movieService.movie.timeline) {
        if (this.movieService.movie.timeline[time].layers.length > 0) {
          layersFound = true;
          break;
        }
      }
      if (layersFound) this.selectedIndex = 1;
    }, 500);
  }

  handleTabChange(event: MatTabChangeEvent) {
    this.selectedIndex = event.index
    // this.movieService.resetSelectedLayer();
    // this.memberService.resetSelectedRecord();
  }

  saveProperty(layer: ILayer, newProperties: ILayerProperties): void {
    this.movieService.updateProperties(this.timelineService.currentTime.value, layer.layerId, newProperties);
  }

  saveAnimation(layer: ILayer, newAnimation: ILayerAnimation): void {
    this.movieService.updateAnimation(this.timelineService.currentTime.value, layer.layerId, newAnimation)
  }

  addOptionToMovieTimeLine(member: Member, option: IMemberOption): void {
    this.movieService.addMemberOptionToTime(this.timelineService.currentTime.value, member.memberId, option.optionId);
  }
}
