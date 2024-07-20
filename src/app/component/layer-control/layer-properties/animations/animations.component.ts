import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, take, takeUntil } from 'rxjs';
import { ComponentBase } from '../../../../base/component-base';
import { IAnimationFrame, ILayerAnimation } from '../../../../interfaces/movie-animations';
import { CssDirection, CssDirections, CssFillMode, CssFillModes, CssTimingFunction, CssTimingFunctions } from '../../../../types/movie-animation';
import { GetDefaultProperties } from '../../../../models/layer';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ILayerProperties } from '../../../../interfaces/movie-properties';
import { ConfirmationDialogComponent } from '../../../_shared/confirmation-dialog/confirmation-dialog.component';
import { IJSONDiff } from '../../../../interfaces/json-diff';
import { UtilService } from '../../../../services/util.service';

@Component({
  selector: 'app-animations',
  templateUrl: './animations.component.html',
  styleUrl: './animations.component.scss'
})
export class AnimationsComponent extends ComponentBase implements OnInit, OnDestroy {

  @Input() time: number = 0;
  @Input() endTime: number = 0;
  @Input() existingProperties?: ILayerProperties;
  @Input() animation?: ILayerAnimation;
  @Input() isProjected = false;
  @Output() onRemoveAnimation = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<ILayerAnimation>();

  @ViewChild('frameStyleRef') frameStyleRef?: TemplateRef<any>;

  autoSave = true;
  includeAnimation = false;
  animationFrameType: string = '';
  animationFrameTypes = {
    fromTo: 'fromTo',
    percent: 'percent'
  }
  animationFrameDiff: {
    toLayerDiff?: IJSONDiff,
    percentFrameDiff?: { [key: number]: IJSONDiff }
  } = {}
  styleDialogRef?: MatDialogRef<any>;
  percentage = new FormControl<number>(0, [Validators.required]);
  CssDirections = CssDirections;
  CssTimingFunctions = CssTimingFunctions;
  CssFillModes = CssFillModes;

  animationForm = new FormGroup({
    duration: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)]),
    delay: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)]),
    iterationCount: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)]),

    direction: new FormControl<CssDirection>('normal', [Validators.required]),
    timingFunction: new FormControl<CssTimingFunction>('ease', [Validators.required]),
    fillMode: new FormControl<CssFillMode>('none', [Validators.required]),
    frame: new FormControl<IAnimationFrame | undefined>({}, [Validators.required]),
  });

  constructor(private matDialog: MatDialog, private utilService: UtilService) {
    super();
  }

  get frameControl(): FormControl<IAnimationFrame | null | undefined> {
    return this.animationForm.controls['frame']
  }

  get frameControlValues(): IAnimationFrame | null | undefined {
    return this.animationForm.controls['frame'].value
  }

  get frameControlPercentList(): string[] {
    return this.frameControlValues && this.frameControlValues.percentFrame ? Object.keys(this.frameControlValues.percentFrame) : [];
  }

  ngOnInit(): void {
    if (this.animation) {
      this.includeAnimation = true;
      this.animationForm.patchValue(this.animation);
      this.initKeyFrameTypeSelection();
      this.startFrameDiffCalculations(this.animation);
    } else {
      this.animationForm.disable();
    }
    if (this.isProjected) this.animationForm.disable();

    this.animationForm.valueChanges
      .pipe(takeUntil(this.isComponentActive), debounceTime(500))
      .subscribe({
        next: val => {
          this.startFrameDiffCalculations(val as ILayerAnimation);
          this.autoSave ? this.submitForm() : null
        }
      })
  }

  ngOnDestroy(): void {
    this.onDestroy();
    this.styleDialogRef?.close();
  }

  initKeyFrameTypeSelection(): void {
    if (!this.animation) return;
    switch (this.animation.frame.toLayer ? true : false) {
      case true:
        this.animationFrameType = this.animationFrameTypes.fromTo
        break;
      case false:
        this.animationFrameType = this.animationFrameTypes.percent
        break;
    }
  }

  startFrameDiffCalculations(formValue: ILayerAnimation) {
    this.animationFrameDiff.toLayerDiff = undefined;
    this.animationFrameDiff.percentFrameDiff = {};
    switch (this.animationFrameType) {

      case this.animationFrameTypes.fromTo:
        this.animationFrameDiff.toLayerDiff = this.existingProperties && formValue.frame.toLayer ? this.utilService.compareJSON(this.existingProperties, formValue.frame.toLayer) : undefined;
        break;

      case this.animationFrameTypes.percent:
        if (!formValue.frame.percentFrame) {
          formValue.frame.percentFrame = {};
        }
        for (let key in formValue.frame.percentFrame) {
          this.animationFrameDiff.percentFrameDiff[key] = this.existingProperties ? this.utilService.compareJSON(this.existingProperties, formValue.frame.percentFrame[key]) : {} as IJSONDiff
        }
        break;
    }
  }

  handleIncludeAnimation(): void {
    if (this.isProjected) return;

    if (this.includeAnimation) {
      this.animationForm.enable();
    } else {
      this.animationForm.disable();
      this.animationForm.reset();
      this.onRemoveAnimation.emit()
    }
  }

  handleFrameTypeChange(): void {
    this.styleDialogRef?.close();
  }

  getFrameExistingProperties(animationFrameType: string, percent: number | undefined = undefined): ILayerProperties | undefined {
    let existingProperty: ILayerProperties | undefined;
    switch (animationFrameType) {

      case this.animationFrameTypes.fromTo:
        if (this.frameControlValues?.toLayer) existingProperty = this.frameControlValues.toLayer;
        break;

      case this.animationFrameTypes.percent:
        if (this.frameControlValues?.percentFrame && percent != undefined && this.frameControlValues.percentFrame[percent])
          existingProperty = this.frameControlValues.percentFrame[percent];
        break;
    }

    return existingProperty;
  }

  handleFrameStyleAdd(animationFrameType: string): void {

    if (animationFrameType === this.animationFrameTypes.percent && this.percentage.invalid) {
      console.log('Percentage value cannot be empty')
      return;
    }
    const percentage = animationFrameType === this.animationFrameTypes.fromTo ? undefined : this.percentage.value ? this.percentage.value : 0;
    const existingProperty = this.getFrameExistingProperties(animationFrameType, percentage);
    if (existingProperty) {
      this.handleFrameStyleEdit(animationFrameType, existingProperty, percentage);
      return;
    }
    const animationFrameStyle = this.existingProperties ? this.existingProperties : GetDefaultProperties(this.time)
    const title = animationFrameType === this.animationFrameTypes.fromTo
      ? 'To styles'
      : `Style at ${this.percentage.value}`;

    this.openAnimationFramePropertiesPopup(title, animationFrameType, animationFrameStyle, percentage);
  }

  handleFrameStyleEdit(animationFrameType: string, animationFrameStyle: ILayerProperties, percent: number | undefined = undefined): void {
    const title = animationFrameType === this.animationFrameTypes.fromTo
      ? 'To styles'
      : `Style at ${percent}`;
    this.openAnimationFramePropertiesPopup(title, animationFrameType, animationFrameStyle, percent);
  }

  openAnimationFramePropertiesPopup(title: string, animationFrameType: string, animationFrameStyle: ILayerProperties, percent: number | undefined = undefined): void {

    let isDialogRefSet = this.styleDialogRef ? true : false;
    this.styleDialogRef?.close();
    const data = {
      animationFrameType,
      animationFrameStyle,
      title,
      percent
    }
    if (isDialogRefSet) {
      setTimeout(() => {
        this.openPropertyPopup(data);
      }, 500);
    } else {
      this.openPropertyPopup(data)
    }
  }

  openPropertyPopup(data: any): void {
    if (!this.frameStyleRef) return;

    this.styleDialogRef = this.matDialog.open(this.frameStyleRef, {
      height: '100%',
      panelClass: 'frame-style-dialog',
      data: data
    });
    this.styleDialogRef.afterClosed()
      .pipe(take(1))
      .subscribe(() => this.styleDialogRef = undefined)
  }

  handleAnimationFramePropertySave(data: ILayerProperties, animationFrameType: string, percent: number | undefined = undefined): void {
    let frame = this.frameControlValues;
    if (!frame) frame = {
      toLayer: undefined,
      percentFrame: {}
    };

    switch (animationFrameType) {

      case this.animationFrameTypes.fromTo:
        frame.percentFrame = undefined;
        frame.toLayer = data;
        break;

      case this.animationFrameTypes.percent:
        frame.toLayer = undefined;
        if (!frame.percentFrame) frame.percentFrame = {};
        frame.percentFrame[percent ? percent : 0] = data;
        break;
    }

    console.log('frame = ', frame)
    this.frameControl.setValue(frame);
    this.frameControl.markAsDirty();
  }

  closeStyleDialog(): void {
    this.styleDialogRef?.close();
  }

  handleOnDeleteProperty(animationFrameType: string, percent: number | undefined = undefined) {
    const ref = this.matDialog.open(ConfirmationDialogComponent, {
      panelClass: 'delete-dialog'
    });
    ref.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: result => result ? this.deleteProperty(animationFrameType, percent) : null
      });
  }

  deleteProperty(animationFrameType: string, percent: number | undefined = undefined) {
    let frameValue = this.frameControlValues;
    if (!frameValue) return;

    switch (animationFrameType) {

      case this.animationFrameTypes.fromTo:
        frameValue.percentFrame = undefined;
        frameValue.toLayer = undefined;
        break;

      case this.animationFrameTypes.percent:
        frameValue.toLayer = undefined;
        if (percent && frameValue.percentFrame && frameValue.percentFrame[percent])
          delete frameValue.percentFrame[percent];
        break;
    }
  }

  submitForm(): void {
    if (!this.animationForm.dirty || this.isProjected) return;

    if (this.animationForm.invalid) console.log('Invalid Form');
    else {
      let formValue: ILayerAnimation | undefined = this.animationForm.disabled ? undefined : (this.animationForm.value as ILayerAnimation);
      formValue = formValue ? this.resetFrameValues(formValue) : undefined;
      this.onSave.emit(formValue);
      this.animationForm.markAsPristine();
    }
  }

  resetFrameValues(formValue: ILayerAnimation | undefined): ILayerAnimation | undefined {
    if (!formValue) return undefined;
    switch (this.animationFrameType) {
      case this.animationFrameTypes.fromTo:
        formValue.frame.percentFrame = undefined;
        break;
      case this.animationFrameTypes.percent:
        formValue.frame.toLayer = undefined;
        break;
    }
    return formValue;
  }
}
