import { Pipe, PipeTransform } from '@angular/core';
import { OptionType } from '../types/member-option.type';

@Pipe({
  name: 'optionTypeIcon'
})
export class OptionTypeIconPipe implements PipeTransform {

  transform(optionType: OptionType): string {
    let r: string = '';
    switch(optionType) {

      case 'video':
        r = 'video_call';
        break;
        
      case 'image':
        r = 'add_a_photo';
        break;

      case 'audio':
        r = 'music_note';
        break;
    }

    return r;
  }

}
