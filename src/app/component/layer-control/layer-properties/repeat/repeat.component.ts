import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ComponentBase } from '../../../../base/component-base';
import { ILayerProperties } from '../../../../interfaces/movie-properties';
import { ILayerRepeat } from '../../../../interfaces/movie-layer-repeat';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-repeat',
  templateUrl: './repeat.component.html',
  styleUrl: './repeat.component.scss'
})
export class RepeatComponent extends ComponentBase implements OnInit, OnDestroy {

  @Input() time: number = 0;
  @Input() layerId: string = '';
  @Input() existingProperties?: ILayerProperties;
  @Input() repeating?: ILayerRepeat;
  @Input() isProjected = false;
  @Output() onRemoveRepeating = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<ILayerRepeat>();

  autoSave = true;
  includeRepeat = false;
  repeatForm = new FormGroup({
    layerId: new FormControl<string>('', [Validators.required]),
    repeatingStartTime: new FormControl<number>(0, [Validators.required]),
    interval: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)]),
    count: new FormControl<number>(0, [Validators.required, Validators.pattern(/^\d+$/)])
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.repeating) {
      this.includeRepeat = true;
      this.repeatForm.patchValue(this.repeating);
    } else {
      this.repeatForm.disable();
    }
    if (this.isProjected) this.repeatForm.disable();

    this.repeatForm.valueChanges
      .pipe(takeUntil(this.isComponentActive), debounceTime(500))
      .subscribe({
        next: () => this.autoSave ? this.submitForm() : null
      })
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  handleIncludeRepeat(): void {
    if (this.isProjected) return;

    if (this.includeRepeat) {
      this.repeatForm.enable();
      this.repeatForm.controls['layerId'].setValue(this.layerId);
      this.repeatForm.controls['repeatingStartTime'].setValue(this.time);
    } else {
      this.repeatForm.disable();
      this.repeatForm.reset();
      this.onRemoveRepeating.emit();
    }
  }

  submitForm(): void {
    if (!this.repeatForm.dirty || this.isProjected) return;

    if (this.repeatForm.invalid) console.log('Invalid Form');
    else {
      this.onSave.emit(this.repeatForm.value as ILayerRepeat);
      this.repeatForm.markAsPristine();
    }
  }
}
