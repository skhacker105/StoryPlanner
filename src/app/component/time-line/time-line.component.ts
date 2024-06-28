import { Component, OnDestroy, OnInit } from '@angular/core';
import { TimelineService } from '../../services/timeline.service';
import { ComponentBase } from '../base/component-base';
import { takeUntil } from 'rxjs';

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

  changeCurrentTime(time: number) {
    this.timelineService.setNewTime(time);
  }
}
