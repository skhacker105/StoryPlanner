import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IPlaySpeed } from '../interfaces/play-speed';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  currentTime = new BehaviorSubject<number>(0);
  endTime = new BehaviorSubject<number>(600);

  standardSpeed = 1000;
  speedRange: IPlaySpeed[] = [
    { key: '0.25', multiple: 1 / 0.25 },
    { key: '0.5', multiple: 1 / 0.5 },
    { key: '0.75', multiple: 1 / 0.75 },
    { key: 'Normal', multiple: 1 },
    { key: '1.25', multiple: 1 / 1.25 },
    { key: '1.5', multiple: 1 / 1.5 },
    { key: '1.75', multiple: 1 / 1.75 },
    { key: '2', multiple: 1 / 2 }
  ];
  selectedSpeed: IPlaySpeed = this.speedRange[3];
  playing = false;
  playingStateChange = new Subject<boolean>();

  private maxPlayTime = -1;

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
    return this.currentTime.value < (this.maxPlayTime !== -1 ? this.maxPlayTime : this.endTime.value);
  }

  setMaxPlayTime(maxTime: number): void {
    this.maxPlayTime = maxTime;
  }

  resetMaxPlayTime(): void {
    this.maxPlayTime = -1;
  }

  play(): void {
    this.playing = true;
    this.playingStateChange.next(true);
    this.runWhilePlaying();
  }

  runWhilePlaying(): void {
    if (this.playing) {
      this.increaseTime();

      if (this.hasNextTime()) {
        setTimeout(() => {
          this.runWhilePlaying();
        }, this.standardSpeed * this.selectedSpeed.multiple);
      } else {
        this.pause();
      }
    }
  }

  pause(): void {
    this.playing = false;
    this.playingStateChange.next(false);
    this.resetMaxPlayTime();
  }

  setPlaybackSpeed(speed: IPlaySpeed) {
    this.selectedSpeed = speed;
  }
}
