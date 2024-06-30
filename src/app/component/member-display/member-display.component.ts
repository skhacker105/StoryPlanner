import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Member } from '../../models/members';

@Component({
  selector: 'app-member-display',
  templateUrl: './member-display.component.html',
  styleUrl: './member-display.component.scss'
})
export class MemberDisplayComponent {
  @Input() member?: Member;
  @Input() isSelected = false;
  @Output() onEdit = new EventEmitter<Member>();
  @Output() onDelete = new EventEmitter<Member>();
  @Output() onCLick = new EventEmitter<Member>();
}
