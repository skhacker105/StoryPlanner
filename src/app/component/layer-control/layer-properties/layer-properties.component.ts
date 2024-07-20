import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ComponentBase } from '../../../base/component-base';
import { ILayer, ILayerRepeat } from '../../../interfaces/movie-layer';
import { Member } from '../../../models/members';
import { IMemberOption } from '../../../interfaces/member';
import { ILayerProperties } from '../../../interfaces/movie-properties';
import { ILayerAnimation } from '../../../interfaces/movie-animations';

@Component({
  selector: 'app-layer-properties',
  templateUrl: './layer-properties.component.html',
  styleUrl: './layer-properties.component.scss'
})
export class LayerPropertiesComponent extends ComponentBase implements OnInit, OnDestroy {

  @Input() time: number = 0;
  @Input() endTime: number = 0;
  @Input() layer?: ILayer;
  @Input() layerMember?: Member;
  @Input() layerOption?: IMemberOption;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onStyleSave = new EventEmitter<ILayerProperties>();
  @Output() onAnimationSave = new EventEmitter<ILayerAnimation | undefined>();
  @Output() onRepeatSave = new EventEmitter<ILayerRepeat | undefined>();
  
  constructor() {
    super();
  }

  ngOnInit(): void {
  }
  
  ngOnDestroy(): void {
    this.onDestroy();
  }
}
