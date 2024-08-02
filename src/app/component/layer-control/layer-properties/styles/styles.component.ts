import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs';
import { ComponentBase } from '../../../../base/component-base';
import { ILayerProperties } from '../../../../interfaces/movie-properties';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-styles',
  templateUrl: './styles.component.html',
  styleUrl: './styles.component.scss'
})
export class StylesComponent extends ComponentBase implements OnInit, OnDestroy {
  @Input() time: number = 0;
  @Input() endTime: number = 0;
  @Input() properties?: ILayerProperties;
  @Input() isProjected = false;
  @Input() timeMultiplier = 1;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<ILayerProperties>();

  autoSave = true;
  degreeValidatorPattern = /\-?\d*\.?\d{1,2}/;

  propertyForm = new FormGroup({

    // Generic
    isInView: new FormControl<boolean>(true),
    isFullScreen: new FormControl<boolean>(false),
    opacity: new FormControl<number>(1.0, [Validators.required, Validators.min(0), Validators.max(1), Validators.pattern(/^\d*\.?\d*$/)]),
    endTime: new FormControl<number>(1, [Validators.pattern(/^-?\d*\.?\d+$/)]),

    // Dimension
    relativeWidth: new FormControl<number>(10, [Validators.min(0), Validators.pattern(/^\d+$/)]),
    relativeHeight: new FormControl<number>(10, [Validators.min(0), Validators.pattern(/^\d+$/)]),

    // Position
    relativeLeft: new FormControl<number>(0, [Validators.pattern(/^-?\d*\.?\d+$/)]),
    relativeTop: new FormControl<number>(0, [Validators.pattern(/^-?\d*\.?\d+$/)]),

    // Rotate
    rotateX: new FormControl<number>(0, [Validators.required, Validators.min(-360), Validators.max(360), Validators.pattern(this.degreeValidatorPattern)]),
    rotateY: new FormControl<number>(0, [Validators.required, Validators.min(-360), Validators.max(360), Validators.pattern(this.degreeValidatorPattern)]),
    rotateZ: new FormControl<number>(0, [Validators.required, Validators.min(-360), Validators.max(360), Validators.pattern(this.degreeValidatorPattern)]),

    // Translate
    translateX: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)]),
    translateY: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)]),
    translateZ: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)]),

    // Scale
    scaleX: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)]),
    scaleY: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)]),

    // Skew
    skewX: new FormControl<number>(0, [Validators.required, Validators.min(-360), Validators.max(360), Validators.pattern(this.degreeValidatorPattern)]),
    skewY: new FormControl<number>(0, [Validators.required, Validators.min(-360), Validators.max(360), Validators.pattern(this.degreeValidatorPattern)]),

  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.properties) {
      const prop = cloneDeep(this.properties);
      prop.endTime = +(prop.endTime * this.timeMultiplier).toFixed(2);
      this.propertyForm.patchValue(prop);
      if (this.isProjected) this.disableNonProjectedPropertyControls();
      this.propertyForm.controls.endTime.addValidators(Validators.min(this.time * this.timeMultiplier));
      this.propertyForm.controls.endTime.addValidators(Validators.max(this.endTime * this.timeMultiplier));
    }

    this.propertyForm.valueChanges
      .pipe(takeUntil(this.isComponentActive), debounceTime(500))
      .subscribe({
        next: val => this.autoSave ? this.submitForm() : null
      })
  }

  disableNonProjectedPropertyControls(): void {
    const projectedControls = ['isInView'];
    Object.keys(this.propertyForm.controls).forEach(control => {
      if (!projectedControls.includes(control)) this.propertyForm.get(control)?.disable();
    });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  submitForm(): void {
    if (!this.properties || !this.propertyForm.dirty) return;

    if (this.propertyForm.invalid) console.log('Invalid Form ');
    else {
      const value = this.propertyForm.value;
      value.endTime = value.endTime ? (value.endTime / this.timeMultiplier) : value.endTime;
      if (value.endTime) value.endTime = Math.round(value.endTime);
      this.onSave.emit(value as ILayerProperties);
      this.propertyForm.markAsPristine();
    }
  }
}
