import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IMemberOption } from '../../../interfaces/member';

@Component({
  selector: 'app-member-option-display',
  templateUrl: './member-option-display.component.html',
  styleUrl: './member-option-display.component.scss'
})
export class MemberOptionDisplayComponent {
  @Input() option?: IMemberOption;
  @Output() addToTimeLine = new EventEmitter<IMemberOption>();
}
