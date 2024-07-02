import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ILayer } from '../../interfaces/movie-layer';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-layer-properties',
  templateUrl: './layer-properties.component.html',
  styleUrl: './layer-properties.component.scss'
})
export class LayerPropertiesComponent implements OnInit {

  @Input() layer?: ILayer;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<ILayer>();

  propertyForm = new FormGroup({
    isInView: new FormControl(true),
    isFullScreen: new FormControl(false),
    relativeWidth: new FormControl<number>(10, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)]),
    relativeHeight: new FormControl<number>(10, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)]),
    relativeLeft: new FormControl<number>(0, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)]),
    relativeTop: new FormControl<number>(0, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)]),
    endTime: new FormControl<number>(1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)])
  });

  constructor(public timelineService: TimelineService) {}

  ngOnInit(): void {
    if (this.layer) {
      this.propertyForm.patchValue(this.layer);
      if (this.layer.isProjected) this.propertyForm.disable();
    }
  }

  submitForm() {
    if (!this.layer) return;

    if (this.propertyForm.invalid) console.log('Invalid Form');
    else {
      const formValue = this.propertyForm.value;
      const updatedLayer: ILayer = Object.assign({}, this.layer, formValue);
      this.propertyForm.markAsPristine();
      this.onSave.emit(updatedLayer);
    }
  }
}
