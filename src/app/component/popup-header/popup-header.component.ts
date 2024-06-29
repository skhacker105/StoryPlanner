import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup-header',
  templateUrl: './popup-header.component.html',
  styleUrl: './popup-header.component.scss'
})
export class PopupHeaderComponent {
  @Input() title = '';
  @Output() onCloseTrigger = new EventEmitter<void>();
}
