import { OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { Subject, takeUntil } from 'rxjs';

@Pipe({
  name: 'spacePadded',
  pure: true
})
export class SpacePaddedPipe implements PipeTransform, OnDestroy {

  isPipeActive = new Subject<boolean>();
  timeMultiplier: number = 0;

  constructor(private timelineService: TimelineService) {
    this.timelineService.standardSpeed
    .pipe(takeUntil(this.isPipeActive))
    .subscribe({
      next: standardSpeed => this.timeMultiplier = standardSpeed / 1000
    });
  }

  ngOnDestroy(): void {
    this.isPipeActive.next(true);
    this.isPipeActive.complete();
  }

  transform(value: number): string {
    return (value * this.timeMultiplier).toFixed(2)
  }

}
