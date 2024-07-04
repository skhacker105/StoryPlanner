import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ILayer, ILayerProperties } from '../../../../interfaces/movie-layer';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Member } from '../../../../models/members';
import { IMemberOption } from '../../../../interfaces/member';
import { debounceTime, takeUntil } from 'rxjs';
import { ComponentBase } from '../../../../base/component-base';

@Component({
  selector: 'app-styles',
  templateUrl: './styles.component.html',
  styleUrl: './styles.component.scss'
})
export class StylesComponent extends ComponentBase implements OnInit, OnDestroy {
  @Input() time: number = 0;
  @Input() endTime: number = 0;
  @Input() layer?: ILayer;
  @Input() layerMember?: Member;
  @Input() layerOption?: IMemberOption;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<ILayerProperties>();

  propertyForm = new FormGroup({

    // Generic
    isInView: new FormControl<boolean>(true),
    isFullScreen: new FormControl<boolean>(false),
    opacity: new FormControl<number>(1.0, Validators.required),
    endTime: new FormControl<number>(1, [Validators.pattern(/^\d+$/)]),

    // Dimension
    relativeWidth: new FormControl<number>(10, [Validators.min(0), Validators.pattern(/^\d+$/)]),
    relativeHeight: new FormControl<number>(10, [Validators.min(0), Validators.pattern(/^\d+$/)]),

    // Position
    relativeLeft: new FormControl<number>(0, [Validators.pattern(/^\d+$/)]),
    relativeTop: new FormControl<number>(0, [Validators.pattern(/^\d+$/)]),

    // Rotate
    rotateX: new FormControl<number>(0, Validators.required),
    rotateY: new FormControl<number>(0, Validators.required),
    rotateZ: new FormControl<number>(0, Validators.required),

    // Translate
    translateX: new FormControl<number>(0, Validators.required),
    translateY: new FormControl<number>(0, Validators.required),
    translateZ: new FormControl<number>(0, Validators.required),

    // Scale
    scaleX: new FormControl<number>(0, Validators.required),
    scaleY: new FormControl<number>(0, Validators.required),

    // Skew
    skewX: new FormControl<number>(0, Validators.required),
    skewY: new FormControl<number>(0, Validators.required),

  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.layer) {
      this.propertyForm.patchValue(this.layer);
      if (this.layer.isProjected) this.propertyForm.disable();
      this.propertyForm.controls.endTime.addValidators(Validators.min(this.time));
      this.propertyForm.controls.endTime.addValidators(Validators.max(this.endTime));
    }

    this.propertyForm.valueChanges
    .pipe(takeUntil(this.isComponentActive), debounceTime(500))
    .subscribe({
      next:val => this.submitForm()
    })
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  submitForm() {
    if (!this.layer || !this.propertyForm.dirty) return;

    if (this.propertyForm.invalid) console.log('Invalid Form');
    else {
      this.onSave.emit(this.propertyForm.value as ILayerProperties);
      this.propertyForm.markAsPristine();
    }
  }
}
