import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ILayer } from '../../../interfaces/movie-layer';
import { Member } from '../../../models/members';
import { IMemberOption } from '../../../interfaces/member';
import { ComponentBase } from '../../../base/component-base';

@Component({
  selector: 'app-layer-display',
  templateUrl: './layer-display.component.html',
  styleUrl: './layer-display.component.scss'
})
export class LayerDisplayComponent extends ComponentBase implements OnInit, OnDestroy {

  @Input() layer?: ILayer;
  @Input() isSelected = false;
  @Input() layerMember?: Member;
  @Input() layerOption?: IMemberOption;
  @Output() onEdit = new EventEmitter<ILayer>();
  @Output() onDelete = new EventEmitter<ILayer>();
  @Output() onCLick = new EventEmitter<ILayer>();
  @Output() onGoToProjectionStart = new EventEmitter<ILayer>();

  hasNoMatch = false;
  isBroken = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.isBroken = !this.layerMember || !this.layerOption;
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  handleDeleteClick(layer: ILayer, e: any): void {
    e.stopPropagation();
    this.onDelete.emit(layer);
  }
}
