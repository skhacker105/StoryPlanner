import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ImageControl } from '../../types/picture.type';

@Component({
  selector: 'app-picture-upload',
  templateUrl: './picture-upload.component.html',
  styleUrl: './picture-upload.component.scss'
})
export class PictureUploadComponent {
  @Input() pictureFormControl?: FormControl<ImageControl>;

  pictureControl = new FormControl<any>('');

  handlePictureUpload(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.pictureFormControl?.setValue(reader.result);
      };
    } else this.resetPictureControl();
  }

  resetPictureControl() {
    this.pictureControl.setValue(null);
    this.pictureFormControl?.setValue(null);
  }
}
