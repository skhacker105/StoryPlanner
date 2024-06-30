import { Component, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddEditMemberComponent } from '../add-edit-member/add-edit-member.component';
import { IMember } from '../../interfaces/member';
import { take } from 'rxjs';
import { MemberService } from '../../services/member.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Member } from '../../models/members';
import { ComponentBase } from '../../base/component-base';

@Component({
  selector: 'app-layer-control',
  templateUrl: './layer-control.component.html',
  styleUrl: './layer-control.component.scss'
})
export class LayerControlComponent extends ComponentBase implements OnDestroy {

  readonly dialog = inject(MatDialog);

  constructor(public memberService: MemberService) {
    super();
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  loadAddMemberPopup() {
    const ref = this.dialog.open(AddEditMemberComponent, {
      width: '90%',
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

  handleAddMember(member: IMember) {
    this.memberService.addNewMember(member);
  }

  loadEditMemberPopup(member: IMember) {
    const ref = this.dialog.open(AddEditMemberComponent, {
      width: '90%',
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

  handleEditMember(member: IMember) {
    this.memberService.updateMember(member);
  }

  handleDeleteConfirmationPopup(member: Member) {
    const ref = this.dialog.open(ConfirmationDialogComponent);
    ref.afterClosed()
    .pipe(take(1))
    .subscribe({
      next: result => result ? this.handleDeleteMember(member) : null
    });
  }

  handleDeleteMember(member: Member) {
    this.memberService.removeMember(member.memberId);
  }

  handleSave() {
    this.memberService.saveMembers();
  }
}
