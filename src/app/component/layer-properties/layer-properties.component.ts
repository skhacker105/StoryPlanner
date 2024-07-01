import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ILayer } from '../../interfaces/movie-layer';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-layer-properties',
  templateUrl: './layer-properties.component.html',
  styleUrl: './layer-properties.component.scss'
})
export class LayerPropertiesComponent implements OnInit {

  @Input() layer?: ILayer;
  @Output() cancelClicked = new EventEmitter<void>();

  propertyForm = new FormGroup({
    isInView: new FormControl(true),
    isFullScreen: new FormControl(false),
    relativeWidth: new FormControl(10, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)]),
    relativeHeight: new FormControl(10, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)]),
    relativeLeft: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)]),
    relativeTop: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern(/^\d+$/)])
  });

  ngOnInit(): void {
    if (this.layer) this.propertyForm.patchValue(this.layer);
  }
}
