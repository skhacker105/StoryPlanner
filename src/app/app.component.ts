import { Component, OnDestroy, OnInit } from '@angular/core';
import { MemberService } from './services/member.service';
import { MovieService } from './services/movie.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TimelineService } from './services/timeline.service';
import { Member } from './models/members';
import { IMemberOption, IMemberOptionItem } from './interfaces/member';
import { ILayerProperties } from './interfaces/movie-properties';
import { ILayer } from './interfaces/movie-layer';
import { ILayerAnimation } from './interfaces/movie-animations';
import { takeUntil } from 'rxjs';
import { ComponentBase } from './base/component-base';
import { FileService } from './services/file.service';
import { DisplayService } from './services/display.service';
import { ILayerRepeat } from './interfaces/movie-layer-repeat';
import { IlayerMedia } from './interfaces/movie-media';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent extends ComponentBase implements OnInit, OnDestroy {
  title = 'StoryPlanner';
  selectedIndex = 0;

  constructor(
    public memberService: MemberService,
    public movieService: MovieService,
    public timelineService: TimelineService,
    private fileService: FileService,
    private displayService: DisplayService) {
    super();
  }

  ngOnInit(): void {
    this.fileService.newVideo
    .pipe(takeUntil(this.isComponentActive))
    .subscribe({
      next: video => video ? this.selectedIndex = 2 : null
    });

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

  ngOnDestroy(): void {
    this.onDestroy();
  }

  handleTabChange(event: MatTabChangeEvent) {
    this.selectedIndex = event.index
    // this.movieService.resetSelectedLayer();
    // this.memberService.resetSelectedRecord();
  }

  saveProperty(layer: ILayer, newProperties: ILayerProperties): void {
    this.movieService.updateProperties(this.timelineService.currentTime.value, layer.layerId, newProperties);
  }

  saveAnimation(layer: ILayer, newAnimation: ILayerAnimation | undefined): void {
    this.movieService.updateAnimation(this.timelineService.currentTime.value, layer.layerId, newAnimation)
  }

  addMemberToCurrentTimeLayer(member: Member, option: IMemberOption): void {
    this.movieService.addMemberToCurrentTimeLayer(this.timelineService.currentTime.value, member, option);
  }

  saveRepeat(layer: ILayer, repeating: ILayerRepeat | undefined): void {
    this.movieService.updateRepeat(this.timelineService.currentTime.value, layer.layerId, repeating)
  }

  saveMedia(layer: ILayer, media: IlayerMedia | undefined): void {
    this.movieService.updateMedia(this.timelineService.currentTime.value, layer.layerId, media )
  }

  handleIconClick(index: number): void {
    if (!this.memberService.selectedMember) return;

    const items: IMemberOptionItem[] = this.memberService.selectedMember.options
      .map(option => ({ file: option.file, type: option.type } as IMemberOptionItem));

    this.displayService.display(items, index);
  }
}
