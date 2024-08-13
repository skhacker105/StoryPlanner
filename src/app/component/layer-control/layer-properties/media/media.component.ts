import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ComponentBase } from '../../../../base/component-base';
import { IlayerMedia } from '../../../../interfaces/movie-media';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TimelineService } from '../../../../services/timeline.service';
import { debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent extends ComponentBase implements OnInit, OnDestroy {

  @Input() time: number = 0;
  @Input() media?: IlayerMedia;
  @Input() isProjected: boolean = false;
  @Input() mediaLength: number = -1;
  @Output() onRemoveMedia = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<IlayerMedia>();

  autoSave = true;
  mediaForm = new FormGroup({
    isMuted: new FormControl<boolean>(false, [Validators.required]),
    startTime: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    endTime: new FormControl<number>(0, [Validators.required, Validators.min(0)])
  });

  constructor(private timelineService: TimelineService) {
    super();
  }

  ngOnInit(): void {
    if (this.mediaLength > 0) {
      this.mediaForm.controls['startTime'].addValidators(Validators.max(this.mediaLength - 1));
      this.mediaForm.controls['endTime'].addValidators(Validators.max(this.mediaLength));
    }
    if (this.media) {
      this.mediaForm.patchValue(this.media);
    } else {
      this.mediaForm.disable();
    }

    this.mediaForm.valueChanges
      .pipe(takeUntil(this.isComponentActive), debounceTime(500))
      .subscribe({
        next: val => this.autoSave ? this.submitForm() : null
      })
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  submitForm(): void {
    if (!this.mediaForm.dirty || this.isProjected) return;

    if (this.mediaForm.invalid) console.log('Invalid Form');
    else {
      this.onSave.emit(this.mediaForm.value as IlayerMedia);
      this.mediaForm.markAsPristine();
    }
  }
}
