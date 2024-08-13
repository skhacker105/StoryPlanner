import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IMember, IMemberOption } from '../../../interfaces/member';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { FileControl } from '../../../types/picture.type';
import { ConfirmationDialogComponent } from '../../_shared/confirmation-dialog/confirmation-dialog.component';
import { take, takeUntil } from 'rxjs';
import { OptionType } from '../../../types/member-option.type';
import { DefaultOptionType } from '../../../constants/constant';
import { ComponentBase } from '../../../base/component-base';
import { UtilService } from '../../../services/util.service';

@Component({
  selector: 'app-add-edit-member',
  templateUrl: './add-edit-member.component.html',
  styleUrl: './add-edit-member.component.scss'
})
export class AddEditMemberComponent extends ComponentBase implements OnInit, OnDestroy {

  readonly dialogRef = inject(MatDialogRef<AddEditMemberComponent>);
  readonly data = inject<IMember | undefined>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialog);
  readonly utilService = inject(UtilService);

  memberForm = new FormGroup({
    id: new FormControl<string>(''),
    name: new FormControl<string>('', { validators: Validators.required }),
    image: new FormControl<FileControl>('', { validators: Validators.required }),
    options: new FormArray([] as any[])
  });

  get popupTitle(): string {
    return this.data?.id ? 'Edit Member Layer' : 'Add Member as Layer';
  }

  get memberNameCtrl(): FormControl<string | null> {
    return this.memberForm.controls['name'];
  }

  get imageCtrl(): FormControl<FileControl> {
    return this.memberForm.controls['image'];
  }

  get optionsFormArray(): FormArray<any> {
    return this.memberForm.controls['options'] as FormArray<any>;
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.data) {
      this.memberForm.patchValue(this.data);
      if (this.data.options.length > 0) {
        this.data.options.forEach(option => {
          const form = this.createNewOptionForm(option);
          this.optionsFormArray.push(form);
        });
      }
    } else {
      this.addNewOption('image');
      this.addNewOption('audio');
      this.addNewOption('video');
    }
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  getFileControl(index: number): FormControl<FileControl> {
    return this.optionsFormArray.controls[index].get('file') as FormControl<FileControl>;
  }

  getTypeControl(index: number): FormControl<OptionType> {
    return this.optionsFormArray.controls[index].get('type') as FormControl<OptionType>;
  }

  createNewOptionForm(value?: IMemberOption, optionType?: OptionType): FormGroup {
    const optionFormGroup = new FormGroup({
      optionId: new FormControl<string>(value ? value.optionId : ''),
      name: new FormControl<string>(value ? value.name : '', [Validators.required]),
      file: new FormControl<FileControl>(value ? value.file : '', [Validators.required]),
      type: new FormControl<OptionType>(value && value.type ? value.type : optionType ?? DefaultOptionType, [Validators.required]),
      length: new FormControl<number>(value && value.length ? value.length : -1),
      thumbnail: new FormControl<string>(value && value.thumbnail ? value.thumbnail : '')
    });

    // Subscribe to file changes and get media length and video thumbnail
    optionFormGroup.controls['file'].valueChanges
    .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: async (file) => {
          if (!file) return;

          // Get Media Length
          const len = await this.utilService.getMediaLength(file, optionType ?? DefaultOptionType)
          optionFormGroup.controls['length'].setValue(len);

          //Get Video thumbnail
          if (optionType === 'video') {
            const thumbnail = await this.utilService.getVideoThumbnail(file);
            optionFormGroup.controls['thumbnail'].setValue(thumbnail);
          }
        }
      });
    return optionFormGroup;
  }

  addNewOption(optionType: OptionType): void {
    const optionForm = this.createNewOptionForm(undefined, optionType);
    this.optionsFormArray.push(optionForm);
  }

  handleRemoveOptionClick(index: number): void {
    const ref = this.dialog.open(ConfirmationDialogComponent);
    ref.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: result => result ? this.removeOption(index) : null
      });
  }

  removeOption(index: number): void {
    this.optionsFormArray.removeAt(index);
  }

  onSubmit(): void {
    if (!this.memberForm.valid) console.log('Invalid Form');
    else this.dialogRef.close(this.memberForm.value);
  }
}
