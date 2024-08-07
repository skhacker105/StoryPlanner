import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMemberOptionItem } from '../../../interfaces/member';
import { Subject, takeUntil } from 'rxjs';
import { DisplayService } from '../../../services/display.service';
import { ComponentBase } from '../../../base/component-base';
import { ViewportScroller } from '@angular/common';

interface IDisplayData {
  items: IMemberOptionItem[];
  selectedIndex: number;
}

@Component({
  selector: 'app-option-display',
  templateUrl: './option-display.component.html',
  styleUrl: './option-display.component.scss'
})
export class OptionDisplayComponent extends ComponentBase implements OnInit, OnDestroy {

  readonly displayService = inject(DisplayService);
  readonly dialogRef = inject(MatDialogRef<OptionDisplayComponent>);
  readonly data = inject<IDisplayData | undefined>(MAT_DIALOG_DATA);

  closeClicked = new Subject<void>();
  loadedOption: IMemberOptionItem | undefined;

  constructor(private viewportScroller: ViewportScroller) {
    super();
  }

  ngOnInit(): void {
    this.loadOption()
    this.displayService.loadPrevItem
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: () => {
          if (!this.data) return;
          this.displayItem(this.data.selectedIndex - 1)
        }
      });
    this.displayService.loadNextItem
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: () => {
          console.log('next')
          if (!this.data) return;
          this.displayItem(this.data.selectedIndex + 1)
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  loadOption() {
    if (this.data && this.data.selectedIndex < this.data.items.length && this.data.selectedIndex >= 0) {
      this.loadedOption = this.data.items[this.data.selectedIndex];
    }
  }

  displayItem(index: number): void {
    if (!this.data) return;
    
    const i = this.data.items.length > 0 ? index % this.data.items.length : -1;
    if (i < 0 || i >= this.data.items.length) return;

    this.data.selectedIndex = i;
    this.loadOption();
    this.scrollToElement(`#icon_${i}`)
  }

  scrollToElement(id: string) {
    const element = document.querySelector(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
      });
    }
  }
}
