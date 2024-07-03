import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SortType } from '../../../types/sort.type';

@Component({
  selector: 'app-sorting-button',
  templateUrl: './sorting-button.component.html',
  styleUrl: './sorting-button.component.scss'
})
export class SortingButtonComponent {

  @Input() sortBy: SortType = 'byName';
  @Input() color: string = 'primary';
  @Output() onClick = new EventEmitter<void>();

  getIconName(): string {
    let iconName = '';
    switch(this.sortBy) {

      case 'byName':
        iconName = 'swap_vertical_circle';
        break;

      case 'byTime':
        iconName = 'swap_horizontal_circle';
        break;
    }
    return iconName;
  }

  getTooltip(): string {
    let getTooltip = '';
    switch(this.sortBy) {

      case 'byName':
        getTooltip = 'Sorted By Name';
        break;

      case 'byTime':
        getTooltip = 'Sorted By Time';
        break;
    }
    return getTooltip;
  }
}
