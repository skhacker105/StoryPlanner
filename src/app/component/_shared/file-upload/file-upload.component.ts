import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FileControl } from '../../../types/picture.type';
import { OptionType } from '../../../types/member-option.type';
import { DefaultOptionType, FileTypes } from '../../../constants/constant';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnChanges {
  @Input() optionType: OptionType = DefaultOptionType;
  @Input() pictureFormControl?: FormControl<FileControl>;

  acceptFileTypes: string = '';
  pictureControl = new FormControl<any>('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['optionType']) {
      this.updateAcceptFileValue(changes['optionType'].currentValue)
    }
  }

  updateAcceptFileValue(type: OptionType): void {
    switch (type) {

      case 'image':
        this.acceptFileTypes = FileTypes.image;
        break;

      case 'video':
        this.acceptFileTypes = FileTypes.video;
        break;

      case 'audio':
        this.acceptFileTypes = FileTypes.audio;
        break;
    }
  }

  handlePictureUpload(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.resetPictureControl();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.pictureFormControl?.setValue(reader.result);
      };
    }
  }

  resetPictureControl(): void {
    this.pictureControl.setValue(null);
    this.pictureFormControl?.setValue(null);
  }
}
