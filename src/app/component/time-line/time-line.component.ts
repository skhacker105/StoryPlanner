import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
  dialogRef?: MatDialogRef<any>
  @ViewChild('settings') settings!: TemplateRef<any>;

  constructor(
    public timelineService: TimelineService,
    public recordingService: RecordingService,
    private dialog: MatDialog
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
}
