import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, takeUntil } from 'rxjs';
import { IPlaySpeed } from '../interfaces/play-speed';
import { ServiceBase } from '../base/service-base';

@Injectable({
  providedIn: 'root'
})
export class TimelineService extends ServiceBase implements OnDestroy {

  currentTime = new BehaviorSubject<number>(0); // in unit time
  currentFrameCount = new BehaviorSubject<number>(0); // frame count completed
  endTime = new BehaviorSubject<number>(600);

  standardSpeed = new BehaviorSubject<number>(1000);
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
  selectedSpeed = new BehaviorSubject<IPlaySpeed>(this.speedRange[3]);

  playing = false;
  maxFPSAllowed = 20;
  framesPerUnitTime = new BehaviorSubject<number>(4);
  playingStateChange = new Subject<boolean>();

  settingStorageKey = 'settingStorage';

  private maxPlayTime = -1;

  constructor() {
    super();
    this.loadSettingFromStorage();
    this.currentTime
      .pipe(takeUntil(this.isServiceActive))
      .subscribe({
        next: () => this.currentFrameCount.next(0)
      });
    combineLatest([this.currentTime, this.endTime, this.standardSpeed, this.framesPerUnitTime, this.selectedSpeed])
      .pipe(takeUntil(this.isServiceActive))
      .subscribe(() => this.saveSettingToStorage());
  }

  get frameSpeedByPerUnitTime(): number {
    return (this.standardSpeed.value * this.selectedSpeed.value.multiple) / this.framesPerUnitTime.value;
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  loadSettingFromStorage(): void {
    const settingData = localStorage.getItem(this.settingStorageKey)
    if (!settingData) return;

    const setting: any = JSON.parse(settingData);
    this.currentTime.next(setting.currentTime);
    this.endTime.next(setting.endTime);
    this.standardSpeed.next(setting.standardSpeed);
    this.framesPerUnitTime.next(setting.framesPerUnitTime);
    this.selectedSpeed.next(setting.selectedSpeed);

  }

  saveSettingToStorage(): void {
    const settingData = {
      currentTime: this.currentTime.value,
      endTime: this.endTime.value,
      standardSpeed: this.standardSpeed.value,
      framesPerUnitTime: this.framesPerUnitTime.value,
      selectedSpeed: this.selectedSpeed.value
    };
    localStorage.setItem(this.settingStorageKey, JSON.stringify(settingData))
  }

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

  gotoNextFrame() {
    if (this.hasNextFrame()) {
      this.currentFrameCount.next(this.currentFrameCount.value + 1);
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

  hasNextFrame() {
    return this.currentFrameCount.value < this.framesPerUnitTime.value
  }

  hasNextTime(): boolean {
    return this.currentTime.value < (this.maxPlayTime !== -1 ? this.maxPlayTime : this.endTime.value);
  }

  getMaxPlayTime(): number {
    return this.maxPlayTime;
  }

  hasMaxPlayTime(): boolean {
    return this.maxPlayTime === -1
  }

  setMaxPlayTime(maxTime: number): void {
    this.maxPlayTime = maxTime;
  }

  resetMaxPlayTime(): void {
    this.maxPlayTime = -1;
  }

  play(): void {
    if (!this.hasNextTime()) this.timeToZero();

    this.playing = true;
    this.playingStateChange.next(true);
    this.runWhilePlaying();
  }

  runWhilePlaying(): void {
    if (this.playing) {

      if (this.hasNextFrame()) {
        setTimeout(() => {
          this.gotoNextFrame();
          this.runWhilePlaying();
        }, this.frameSpeedByPerUnitTime);

      } else {

        if (this.hasNextTime()) {
          this.increaseTime();
          this.runWhilePlaying();

        } else {
          this.pause();
        }
      }
    }
  }

  pause(): void {
    this.playing = false;
    this.playingStateChange.next(false);
    this.resetMaxPlayTime();
  }
}
