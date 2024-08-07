import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FileControl } from '../../../types/picture.type';
import { OptionType } from '../../../types/member-option.type';

@Component({
  selector: 'app-option-icon',
  templateUrl: './option-icon.component.html',
  styleUrl: './option-icon.component.scss'
})
export class OptionIconComponent {
  @Input() file?: FileControl;
  @Input() optionType?: OptionType;
  @Output() onIconClick = new EventEmitter<void>();
}
