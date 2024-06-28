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

  increaseTime(): void {
    if (this.hasNextTime()) {
      this.currentTime.next(this.currentTime.value + 1);
    }
  }

  decreaseTime(): void {
    if (this.currentTime.value > 0) {
      this.currentTime.next(this.currentTime.value - 1);
    }
  }

  timeToZero(): void {
    this.currentTime.next(0);
  }

  timeToEnd(): void {
    this.currentTime.next(this.endTime.value);
  }

  hasNextTime(): boolean {
    return this.currentTime.value < this.endTime.value;
  }

  play(): void {
    this.playing = true;
    this.runWhilePlaying();
  }

  runWhilePlaying(): void {
    if (this.playing) {
      this.increaseTime();

      if (this.hasNextTime()) {
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
