import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs';
import { ComponentBase } from '../../../../base/component-base';
import { ILayerProperties } from '../../../../interfaces/movie-properties';

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
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<ILayerProperties>();

  autoSave = true;
  degreeValidatorPattern = /\-?\d*\.?\d{1,2}/;

  propertyForm = new FormGroup({

    // Generic
    isInView: new FormControl<boolean>(true),
    isFullScreen: new FormControl<boolean>(false),
    opacity: new FormControl<number>(1.0, [Validators.required, Validators.min(0), Validators.max(1), Validators.pattern(/^\d*\.?\d*$/)]),
    endTime: new FormControl<number>(1, [Validators.pattern(/^\d+$/)]),

    // Dimension
    relativeWidth: new FormControl<number>(10, [Validators.min(0), Validators.pattern(/^\d+$/)]),
    relativeHeight: new FormControl<number>(10, [Validators.min(0), Validators.pattern(/^\d+$/)]),

    // Position
    relativeLeft: new FormControl<number>(0, [Validators.pattern(/^\d+$/)]),
    relativeTop: new FormControl<number>(0, [Validators.pattern(/^\d+$/)]),

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
      this.propertyForm.patchValue(this.properties);
      if (this.isProjected) this.propertyForm.disable();
      this.propertyForm.controls.endTime.addValidators(Validators.min(this.time));
      this.propertyForm.controls.endTime.addValidators(Validators.max(this.endTime));
    }

    this.propertyForm.valueChanges
      .pipe(takeUntil(this.isComponentActive), debounceTime(500))
      .subscribe({
        next: val => this.autoSave ? this.submitForm() : null
      })
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  submitForm(): void {
    if (!this.properties || !this.propertyForm.dirty) return;

    if (this.propertyForm.invalid) console.log('Invalid Form ');
    else {
      this.onSave.emit(this.propertyForm.value as ILayerProperties);
      this.propertyForm.markAsPristine();
    }
  }
}
