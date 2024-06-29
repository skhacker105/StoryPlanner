import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IMember } from '../../interfaces/member';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ImageControl } from '../../types/picture.type';

@Component({
  selector: 'app-add-edit-member',
  templateUrl: './add-edit-member.component.html',
  styleUrl: './add-edit-member.component.scss'
})
export class AddEditMemberComponent implements OnInit {

  readonly dialogRef = inject(MatDialogRef<AddEditMemberComponent>);
  readonly data = inject<IMember | undefined>(MAT_DIALOG_DATA);

  memberForm = new FormGroup({
    memberId: new FormControl<string>(''),
    name: new FormControl<string>('', { validators: Validators.required }),
    image: new FormControl<ImageControl>('', { validators: Validators.required }),
    options: new FormArray([] as any[])
  });

  get popupTitle(): string {
    return this.data?.memberId ? 'Edit Member Layer' : 'Add Member as Layer';
  }

  get memberNameCtrl(): FormControl<string | null> {
    return this.memberForm.controls['name'];
  }

  get imageCtrl(): FormControl<ImageControl> {
    return this.memberForm.controls['image'];
  }

  ngOnInit(): void {
     if (this.data) {
      this.memberForm.patchValue(this.data);
     }
  }

  createNewOptionForm(): FormGroup {
    return new FormGroup({
      optionId: new FormControl<string>(''),
      name: new FormControl<string>('', { validators: Validators.required }),
      image: new FormControl<string>('', { validators: Validators.required })
    });
  }

  onSubmit() {
    this.dialogRef.close(this.memberForm.value);
  }
}
