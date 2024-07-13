import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IMember, IMemberOption } from '../../../interfaces/member';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ImageControl } from '../../../types/picture.type';
import { ConfirmationDialogComponent } from '../../_shared/confirmation-dialog/confirmation-dialog.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-add-edit-member',
  templateUrl: './add-edit-member.component.html',
  styleUrl: './add-edit-member.component.scss'
})
export class AddEditMemberComponent implements OnInit {

  readonly dialogRef = inject(MatDialogRef<AddEditMemberComponent>);
  readonly data = inject<IMember | undefined>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialog);

  memberForm = new FormGroup({
    id: new FormControl<string>(''),
    name: new FormControl<string>('', { validators: Validators.required }),
    image: new FormControl<ImageControl>('', { validators: Validators.required }),
    options: new FormArray([] as any[])
  });

  get popupTitle(): string {
    return this.data?.id ? 'Edit Member Layer' : 'Add Member as Layer';
  }

  get memberNameCtrl(): FormControl<string | null> {
    return this.memberForm.controls['name'];
  }

  get imageCtrl(): FormControl<ImageControl> {
    return this.memberForm.controls['image'];
  }

  get optionsFormArray(): FormArray<any> {
    return this.memberForm.controls['options'] as FormArray<any>;
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
     }
  }

  getImageControl(index: number): FormControl<ImageControl> {
    return this.optionsFormArray.controls[index].get('image') as FormControl<ImageControl>;
  }

  createNewOptionForm(value?: IMemberOption): FormGroup {
    return new FormGroup({
      optionId: new FormControl<string>(value ? value.optionId : ''),
      name: new FormControl<string>(value ? value.name : '', { validators: Validators.required }),
      image: new FormControl<ImageControl>(value ? value.image : '', { validators: Validators.required })
    });
  }

  addNewOption(): void {
    const optionForm = this.createNewOptionForm();
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
