import { Component, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddEditMemberComponent } from '../add-edit-member/add-edit-member.component';
import { IMember, IMemberOption } from '../../interfaces/member';
import { take } from 'rxjs';
import { MemberService } from '../../services/member.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Member } from '../../models/members';
import { ComponentBase } from '../../base/component-base';
import { MovieService } from '../../services/movie.service';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-member-control',
  templateUrl: './member-control.component.html',
  styleUrl: './member-control.component.scss'
})
export class MemberControlComponent extends ComponentBase implements OnDestroy {

  readonly dialog = inject(MatDialog);

  constructor(public memberService: MemberService, public movieService: MovieService, private timeLineService: TimelineService) {
    super();
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  compareSelectedMembers(member: IMember): boolean {
    return member.memberId === this.memberService.selectedMember?.['memberId'];
  }

  loadAddMemberPopup(): void {
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

  handleAddMember(member: IMember): void {
    this.memberService.addNewMember(member);
  }

  loadEditMemberPopup(member: IMember): void {
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
    this.memberService.removeMember(member.memberId);
    if (this.memberService.selectedMember?.memberId === member.memberId) this.memberService.selectedMember = undefined;
  }

  handleMemberClick(member: Member): void {
    if (!this.compareSelectedMembers(member)) {
      this.memberService.selectRecord(member)
    } else {
      this.memberService.resetSelectedRecord();
    }
  }
}
