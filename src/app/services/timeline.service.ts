import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  currentTime = new BehaviorSubject<number>(0);
  endTime = new BehaviorSubject<number>(600);

  playing = false;

  constructor() { }

  setNewTime(time: number): void {
    this.currentTime.next(time);
  }

  setEndTime(time: number): void {
    this.endTime.next(time);
  }

  reset(): void {
    this.currentTime.next(0);
  }

  play(): void {
    this.playing = true;
    this.runWhilePlaying();
  }

  runWhilePlaying(): void {
    if (this.playing) {
      this.currentTime.next(this.currentTime.value + 1);

      if (this.currentTime.value < this.endTime.value) {
        setTimeout(() => {
          this.runWhilePlaying();
        }, 1000);
      } else {
        this.pause();
      }
    }
  }

  pause(): void {
    this.playing = false;
  }
}
