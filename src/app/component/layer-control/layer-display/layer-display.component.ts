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
  @Input() thumbnail: string | undefined;
  @Output() onEdit = new EventEmitter<ILayer>();
  @Output() onDelete = new EventEmitter<ILayer>();
  @Output() onCLick = new EventEmitter<ILayer>();
  @Output() onIconCLick = new EventEmitter<void>();
  @Output() onGoToProjectionStart = new EventEmitter<ILayer>();

  hasNoMatch = false;
  isBroken = false;
  iconClicked = false;

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

  handleCLick(): void {
    if (this.iconClicked) {
      this.iconClicked = false;
      return;
    }
    this.onCLick.emit();
  }

  handleIconClick(): void {
    this.iconClicked = true;
    this.onIconCLick.emit();
  }
}
