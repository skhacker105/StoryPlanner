import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ILayer } from '../../interfaces/movie-layer';
import { IMemberStorage } from '../../interfaces/member-storage';
import { Member } from '../../models/members';
import { IMemberOption } from '../../interfaces/member';
import { MemberService } from '../../services/member.service';
import { takeUntil } from 'rxjs';
import { ComponentBase } from '../../base/component-base';

@Component({
  selector: 'app-layer-display',
  templateUrl: './layer-display.component.html',
  styleUrl: './layer-display.component.scss'
})
export class LayerDisplayComponent extends ComponentBase implements OnInit, OnDestroy {

  @Input() layer?: ILayer;
  @Input() isSelected = false;
  @Output() onEdit = new EventEmitter<ILayer>();
  @Output() onDelete = new EventEmitter<ILayer>();
  @Output() onCLick = new EventEmitter<ILayer>();

  layerMember?: Member;
  layerOption?: IMemberOption;
  hasNoMatch = false;

  constructor(private memberService: MemberService) {
    super();
  }

  ngOnInit(): void {
    this.memberService.members
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: members => {
          this.loadLayerMember(members);
          this.loadLayerOption(this.layerMember);
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  loadLayerMember(members: Member[]): void {
    if (!this.layer) return;

    this.layerMember = members.find(m => m.memberId === this.layer?.memberId);
    if (!this.layerMember) this.hasNoMatch = true;
  }

  loadLayerOption(member?: Member) {
    if (!member || !this.layer) return;

    this.layerOption = member.options.find(o => o.optionId === this.layer?.memberOptionId);
    if (!this.layerOption) this.hasNoMatch = true;
  }
}
