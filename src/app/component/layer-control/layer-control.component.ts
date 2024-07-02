import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { TimelineService } from '../../services/timeline.service';
import { ComponentBase } from '../../base/component-base';
import { take, takeUntil } from 'rxjs';
import { ILayer } from '../../interfaces/movie-layer';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/members';
import { IMemberOption } from '../../interfaces/member';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

interface IMemberBookDictionary {
  [key: string]: { member: Member, option: IMemberOptionDictionary }
}

interface IMemberOptionDictionary {
  [key: string]: IMemberOption
}

@Component({
  selector: 'app-layer-control',
  templateUrl: './layer-control.component.html',
  styleUrl: './layer-control.component.scss'
})
export class LayerControlComponent extends ComponentBase implements OnInit, OnDestroy {

  readonly dialog = inject(MatDialog);

  currentTime: number = 0;
  dictionaryMemberBook: IMemberBookDictionary = {};

  constructor(public movieService: MovieService, public timelineService: TimelineService, private memberService: MemberService) {
    super();
  }

  ngOnInit(): void {
    this.timelineService.currentTime
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: time => {
          if (this.currentTime !== time) {
            this.currentTime = time;
            this.resetSelectedLayer();
          }
        }
      });
    this.memberService.members
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: members => this.dictionaryMemberBook = this.getMemberOptionDictionary(members)
    });
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  compareSelectedLayer(layer: ILayer): boolean {
    return layer.layerId === this.selectedLayer?.['layerId'];
  }

  getMemberOptionDictionary(members: Member[]): IMemberBookDictionary {
    return members.reduce(
      (objMember: IMemberBookDictionary, member: Member) => {

        if (!objMember[member.memberId]) objMember[member.memberId] = { member, option: {} }

        member.options.reduce(
          (objOption: IMemberOptionDictionary, option: IMemberOption) => {

            if (!objOption[option.optionId]) objOption[option.optionId] = option;
            return objOption;
          },
          objMember[member.memberId].option)
        return objMember;
      },
      {} as IMemberBookDictionary)
  }

  handleLayerClick(layer: ILayer): void {
    if (!this.compareSelectedLayer(layer)) {
      this.selectLayer(layer)
    } else {
      this.resetSelectedLayer();
    }
  }

  handleDeleteConfirmationPopup(layer: ILayer): void {
    const ref = this.dialog.open(ConfirmationDialogComponent);
    ref.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: result => result ? this.handleDeleteLayer(layer) : null
      });
  }

  handleDeleteLayer(layer: ILayer): void {
    this.movieService.removeLayer(this.timelineService.currentTime.value, layer.layerId);
  }

  handleUpdateLayer(updatedLayer: ILayer): void {
    this.movieService.updateLayer(this.timelineService.currentTime.value, updatedLayer);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (!this.movieService.movie) return;
    this.movieService.moveLayers(this.timelineService.currentTime.value, event.previousIndex, event.currentIndex);
  }
}
