import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spacePadded'
})
export class SpacePaddedPipe implements PipeTransform {

  transform(value: number, padLength: number): unknown {
    return value.toString().padStart(padLength, ' ');
  }

}
