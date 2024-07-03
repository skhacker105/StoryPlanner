import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ILayer } from '../../../../interfaces/movie-layer';
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
  @Output() onSave = new EventEmitter<ILayer>();

  propertyForm = new FormGroup({
    isInView: new FormControl(true),
    isFullScreen: new FormControl(false),
    relativeWidth: new FormControl<number>(10, [Validators.min(0), Validators.pattern(/^\d+$/)]),
    relativeHeight: new FormControl<number>(10, [Validators.min(0), Validators.pattern(/^\d+$/)]),
    relativeLeft: new FormControl<number>(0, [Validators.pattern(/^\d+$/)]),
    relativeTop: new FormControl<number>(0, [Validators.pattern(/^\d+$/)]),
    endTime: new FormControl<number>(1, [Validators.pattern(/^\d+$/)])
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
      const formValue = this.propertyForm.value;
      const updatedLayer: ILayer = Object.assign({}, this.layer, formValue);
      this.propertyForm.markAsPristine();
      this.onSave.emit(updatedLayer);
    }
  }
}
