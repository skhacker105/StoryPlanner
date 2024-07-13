import { Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { TimelineService } from '../../services/timeline.service';
import { ComponentBase } from '../../base/component-base';
import { takeUntil } from 'rxjs';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { RecordingService } from '../../services/recording.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-time-line',
  templateUrl: './time-line.component.html',
  styleUrl: './time-line.component.scss'
})
export class TimeLineComponent extends ComponentBase implements OnInit, OnDestroy {

  arrTime: number[] = [];
  minimumNumDisplayLength = 10;
  dialogRef?: MatDialogRef<any>;
  @ViewChild('settings') settings!: TemplateRef<any>;

  constructor(
    public timelineService: TimelineService,
    public recordingService: RecordingService,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.endTime
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: time => {
          this.arrTime = (new Array(time + 1)).fill(0).map((x, i) => i);
        }
      });

    this.recordingService.unitTimeRecordingPercent
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: percent => this.updateUnitTimeFramePercentStyle(percent)
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
    !this.recordingService.recording.value ? this.recordingService.startRecording() : this.recordingService.stopRecording();
  }

  handleSettingClick(): void {
    this.dialogRef = this.dialog.open(this.settings);
  }

  updateUnitTimeFramePercentStyle(percent: number): void {

    const time = this.el.nativeElement.querySelector('#time-display');
    this.renderer.setStyle(time, 'background', `linear-gradient(to right, #dffba5 ${percent}%, white 1%)`);
  }
}
