import { Component, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddEditMemberComponent } from './add-edit-member/add-edit-member.component';
import { IMember, IMemberOption, IMemberOptionItem } from '../../interfaces/member';
import { take } from 'rxjs';
import { MemberService } from '../../services/member.service';
import { ConfirmationDialogComponent } from '../_shared/confirmation-dialog/confirmation-dialog.component';
import { Member } from '../../models/members';
import { ComponentBase } from '../../base/component-base';
import { MovieService } from '../../services/movie.service';
import { DisplayService } from '../../services/display.service';
import { DefaultOptionType } from '../../constants/constant';

@Component({
  selector: 'app-member-control',
  templateUrl: './member-control.component.html',
  styleUrl: './member-control.component.scss'
})
export class MemberControlComponent extends ComponentBase implements OnDestroy {

  readonly dialog = inject(MatDialog);
  readonly displayService = inject(DisplayService);
  
  iconClicked = false;

  constructor(public memberService: MemberService, public movieService: MovieService) {
    super();
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  compareSelectedMembers(member: IMember): boolean {
    return member.id === this.memberService.selectedMember?.['id'];
  }

  loadAddMemberPopup(): void {
    const ref = this.dialog.open(AddEditMemberComponent, {
      width: '478px',
      height: '90%'
    });

    ref.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: result => {
          if (result) this.handleAddMember(result);
        }
      });
  }

  handleAddMember(member: IMember): void {
    this.memberService.addNewMember(member);
  }

  loadEditMemberPopup(member: IMember): void {
    const ref = this.dialog.open(AddEditMemberComponent, {
      width: '478px',
      height: '90%',
      data: member
    });

    ref.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: result => {
          if (result) this.handleEditMember(result);
        }
      });
  }

  handleEditMember(member: IMember): void {
    this.memberService.updateMember(member);
  }

  handleDeleteConfirmationPopup(member: Member): void {
    const ref = this.dialog.open(ConfirmationDialogComponent);
    ref.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: result => result ? this.handleDeleteMember(member) : null
      });
  }

  handleDeleteMember(member: Member): void {
    this.memberService.removeMember(member.id);
    if (this.memberService.selectedMember?.id === member.id) this.memberService.selectedMember = undefined;
  }

  handleMemberClick(member: Member): void {
    if (this.iconClicked) {
      this.iconClicked = false;
      return;
    }
    if (!this.compareSelectedMembers(member)) {
      this.memberService.selectRecord(member)
    } else {
      this.memberService.resetSelectedRecord();
    }
  }

  handleIconClick(index: number): void {
    this.iconClicked = true;
    const items: IMemberOptionItem[] = this.memberService.members.value
      .map(member => ({ file: member.image, type: DefaultOptionType } as IMemberOptionItem));

    this.displayService.display(items, index);
  }
}
