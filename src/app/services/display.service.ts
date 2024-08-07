import { Injectable } from '@angular/core';
import { IMemberOptionItem } from '../interfaces/member';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OptionDisplayComponent } from '../component/_shared/option-display/option-display.component';
import { merge, Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  dialogOpened = new Subject<void>();
  closeDisplay = new Subject<void>();
  loadPrevItem = new Subject<void>();
  loadNextItem = new Subject<void>();

  constructor(private dialog: MatDialog) { }

  display(items: IMemberOptionItem[], index: number): MatDialogRef<any> {
    const ref = this.dialog.open(OptionDisplayComponent, {
      data: { items, selectedIndex: index }
    });
    merge(ref.componentInstance.closeClicked, this.closeDisplay)
      .pipe(take(1))
      .subscribe({
        next: () => {
          ref.close()
        }
      });
    this.dialogOpened.next();
    return ref;
  }

  displayOption(option: IMemberOptionItem): MatDialogRef<any> {
    return this.display([option], 0);
  }

  displayPrevItem(): void {
    this.loadPrevItem.next();
  }

  displayNextItem() {
    this.loadNextItem.next();
  }
}
