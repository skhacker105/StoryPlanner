import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FileControl } from '../../../types/picture.type';
import { OptionType } from '../../../types/member-option.type';
import { DefaultOptionType, FileTypes } from '../../../constants/constant';
import { UtilService } from '../../../services/util.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnChanges {

  @Input() thumbnail: string = '';
  @Input() optionType: OptionType = DefaultOptionType;
  @Input() fileFormControl?: FormControl<FileControl>;

  utilService = inject(UtilService);

  acceptFileTypes: string = '';
  fileControl = new FormControl<any>('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['optionType']) {
      this.updateAcceptFileValue(changes['optionType'].currentValue)
    }
  }

  updateAcceptFileValue(type: OptionType) {
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

  handleFileUpload(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.resetFileControl();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        this.fileFormControl?.setValue(reader.result);
      };
    }
  }

  resetFileControl(): void {
    this.fileControl.setValue(null);
    this.fileFormControl?.setValue(null);
  }
}
