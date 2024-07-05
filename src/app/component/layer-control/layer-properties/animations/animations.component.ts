import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ILayer, } from '../../../../interfaces/movie-layer';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Member } from '../../../../models/members';
import { IMemberOption } from '../../../../interfaces/member';
import { debounceTime, takeUntil } from 'rxjs';
import { ComponentBase } from '../../../../base/component-base';
import { IAnimationFrame, ILayerAnimation } from '../../../../interfaces/movie-animations';
import { CssDirection, CssDirections, CssFillMode, CssFillModes, CssTimingFunction, CssTimingFunctions } from '../../../../types/movie-animation';

@Component({
  selector: 'app-animations',
  templateUrl: './animations.component.html',
  styleUrl: './animations.component.scss'
})
export class AnimationsComponent extends ComponentBase implements OnInit, OnDestroy {
  @Input() time: number = 0;
  @Input() endTime: number = 0;
  @Input() animation?: ILayerAnimation;
  @Input() isProjected = false;
  @Output() onRemoveAnimation = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<ILayerAnimation>();

  autoSave = true;
  includeAnimation = false;
  animationFrameType: string = '';
  CssDirections = CssDirections;
  CssTimingFunctions = CssTimingFunctions;
  CssFillModes = CssFillModes;

  animationForm = new FormGroup({
    duration: new FormControl<number>(0, [Validators.pattern(/^\d+$/)]),
    delay: new FormControl<number>(0, [Validators.pattern(/^\d+$/)]),
    iterationCount: new FormControl<number>(0, [Validators.pattern(/^\d+$/)]),
    direction: new FormControl<CssDirection>('normal', [Validators.pattern(/^\d+$/)]),
    timingFunction: new FormControl<CssTimingFunction>('ease', [Validators.pattern(/^\d+$/)]),
    fillMode: new FormControl<CssFillMode>('none', [Validators.pattern(/^\d+$/)]),
    frame: new FormControl<IAnimationFrame>({}, [Validators.pattern(/^\d+$/)])
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.animation) {
      this.includeAnimation = true;
      this.animationForm.patchValue(this.animation);
      if (this.isProjected) this.animationForm.disable();
    } else {
      this.animationForm.disable();
    }

    this.animationForm.valueChanges
    .pipe(takeUntil(this.isComponentActive), debounceTime(500))
    .subscribe({
      next:val => this.autoSave ? this.submitForm() : null
    })
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  handleIncludeAnimation(): void {
    if (this.includeAnimation) {
      this.animationForm.enable();
    } else {
      this.animationForm.disable();
      this.onRemoveAnimation.emit()
    }
  }

  submitForm(): void {
    if (!this.animation || !this.animationForm.dirty) return;

    if (this.animationForm.invalid) console.log('Invalid Form');
    else {
      this.onSave.emit(this.animationForm.value as ILayerAnimation);
      this.animationForm.markAsPristine();
    }
  }
}
