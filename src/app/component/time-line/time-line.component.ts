import { Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { TimelineService } from '../../services/timeline.service';
import { ComponentBase } from '../../base/component-base';
import { takeUntil } from 'rxjs';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { RecordingService } from '../../services/recording.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IPlaySpeed } from '../../interfaces/play-speed';
import { MovieService } from '../../services/movie.service';

const settingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const standardSpeed = control.get('standardSpeed')?.value as number;
  const framesPerUnitTime = control.get('framesPerUnitTime')?.value as number;
  const selectedSpeed = control.get('selectedSpeed')?.value as IPlaySpeed;
  if (standardSpeed && framesPerUnitTime && selectedSpeed) {
    if (((standardSpeed * selectedSpeed.multiple) / framesPerUnitTime) < 50) {
      return {
        settingError: true
      }
    }
  }
  return null;
}

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

  settingForm = new FormGroup({
    standardSpeed: new FormControl<number>(0, [Validators.required]),
    framesPerUnitTime: new FormControl<number>(0, [Validators.required]),
    selectedSpeed: new FormControl<IPlaySpeed | undefined>(undefined, [Validators.required])
  }, settingValidator);

  constructor(
    public timelineService: TimelineService,
    public recordingService: RecordingService,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private el: ElementRef,
    public movieService: MovieService
  ) {
    super();
  }

  get selectedSpeedCtrl(): FormControl<IPlaySpeed | null | undefined> {
    return this.settingForm.controls['selectedSpeed']
  }

  get calculatedValue(): number {
    const standardSpeed = this.settingForm.controls['standardSpeed']?.value as number;
    const framesPerUnitTime = this.settingForm.controls['framesPerUnitTime']?.value as number;
    const selectedSpeed = this.settingForm.controls['selectedSpeed']?.value as IPlaySpeed;
    if (standardSpeed && framesPerUnitTime && selectedSpeed) {
      return +(1000 / ((standardSpeed * selectedSpeed.multiple) / framesPerUnitTime)).toFixed(2)
    }
    return 0;
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

  playPause(): void {
    this.timelineService.playing ? this.timelineService.pause() : this.timelineService.play()
  }

  toggleRecording(): void {
    !this.recordingService.recording.value ? this.recordingService.startRecording() : this.recordingService.stopRecording();
  }

  handleSettingClick(): void {
    this.prepareSettingForm();
    this.dialogRef = this.dialog.open(this.settings);
  }

  prepareSettingForm(): void {
    this.settingForm.reset()
    this.settingForm.markAsPristine();
    this.settingForm.patchValue({
      standardSpeed: this.timelineService.standardSpeed.value,
      framesPerUnitTime: this.timelineService.framesPerUnitTime.value,
      selectedSpeed: this.timelineService.selectedSpeed.value
    });
  }

  updateSettings(): void {
    if (!this.settingForm.dirty) return;

    if (this.settingForm.invalid) console.log('Invalid Form');

    const settingFormValue = this.settingForm.value;
    if (settingFormValue.standardSpeed) this.timelineService.standardSpeed.next(settingFormValue.standardSpeed);
    if (settingFormValue.selectedSpeed) this.timelineService.selectedSpeed.next(settingFormValue.selectedSpeed);
    if (settingFormValue.framesPerUnitTime) this.timelineService.framesPerUnitTime.next(settingFormValue.framesPerUnitTime);

    this.dialogRef?.close()
  }

  updateUnitTimeFramePercentStyle(percent: number): void {

    const time = this.el.nativeElement.querySelector('#time-display');
    this.renderer.setStyle(time, 'background', `linear-gradient(to right, #dffba5 ${percent}%, white 1%)`);
  }
}
