import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ComponentBase } from '../../../base/component-base';
import { ILayer } from '../../../interfaces/movie-layer';
import { Member } from '../../../models/members';
import { IMemberOption } from '../../../interfaces/member';
import { ILayerProperties } from '../../../interfaces/movie-properties';
import { ILayerAnimation } from '../../../interfaces/movie-animations';
import { OptionType } from '../../../types/member-option.type';
import { ILayerRepeat } from '../../../interfaces/movie-layer-repeat';

@Component({
  selector: 'app-layer-properties',
  templateUrl: './layer-properties.component.html',
  styleUrl: './layer-properties.component.scss'
})
export class LayerPropertiesComponent extends ComponentBase implements OnInit, OnDestroy {

  @Input() time: number = 0;
  @Input() endTime: number = 0;
  @Input() layer?: ILayer;
  @Input() timeMultiplier = 1;
  @Input() layerMember?: Member;
  @Input() layerOption?: IMemberOption;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onStyleSave = new EventEmitter<ILayerProperties>();
  @Output() onAnimationSave = new EventEmitter<ILayerAnimation | undefined>();
  @Output() onRepeatSave = new EventEmitter<ILayerRepeat | undefined>();
  
  styleIsVisible = false;
  animationIsVisible = false;
  repeatIsVisible = false;
  mediaIsVisible = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.layerOption) {
      this.activatePropertyTabFor(this.layerOption.type);
    }
  }
  
  ngOnDestroy(): void {
    this.onDestroy();
  }

  activatePropertyTabFor(optionType: OptionType): void {
    this.disableAllPropertyTabs();
    switch(optionType) {
      case 'image': this.enableImagePropertyTabs(); break;
      case 'audio': this.enableAudioPropertyTabs(); break;
      case 'video': this.enableVideoPropertyTabs(); break;
    }
  }

  enableImagePropertyTabs(): void {
    this.styleIsVisible = true;
    this.animationIsVisible = true;
    this.repeatIsVisible = true;
  }

  enableAudioPropertyTabs(): void {
    this.repeatIsVisible = true;
    this.mediaIsVisible = true;
  }

  enableVideoPropertyTabs(): void {
    this.styleIsVisible = true;
    this.animationIsVisible = true;
    this.repeatIsVisible = true;
    this.mediaIsVisible = true;
  }

  disableAllPropertyTabs(): void {
    this.styleIsVisible = false;
    this.animationIsVisible = false;
    this.repeatIsVisible = false;
    this.mediaIsVisible = false;
  }
}
