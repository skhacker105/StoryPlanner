import { Component, OnDestroy, OnInit } from '@angular/core';
import { TimelineService } from '../../services/timeline.service';
import { ComponentBase } from '../../base/component-base';
import { takeUntil } from 'rxjs';
import { IPlaySpeed } from '../../interfaces/play-speed';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-time-line',
  templateUrl: './time-line.component.html',
  styleUrl: './time-line.component.scss'
})
export class TimeLineComponent extends ComponentBase implements OnInit, OnDestroy {

  arrTime: number[] = [];
  minimumNumDisplayLength = 10;

  constructor(
    public timelineService: TimelineService
  ) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.endTime
    .pipe(takeUntil(this.isComponentActive))
    .subscribe({
      next: time => {
        this.arrTime = (new Array(time + 1)).fill(0).map((x,i) => i);
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  changeCurrentTime(time: number): void {
    this.timelineService.setNewTime(time);
  }

  changePlaybackSpeed(speedChange: MatButtonToggleChange): void {
    this.timelineService.setPlaybackSpeed(speedChange.value);
  }

  playPause(): void {
    this.timelineService.playing ? this.timelineService.pause() : this.timelineService.play()
  }

  toggleRecording(): void {
    !this.timelineService.recording.value ? this.timelineService.startRecording() : this.timelineService.stopRecording();
  }
}
