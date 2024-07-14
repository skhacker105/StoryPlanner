import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spacePadded',
  pure: true
})
export class SpacePaddedPipe implements PipeTransform {

  transform(value: number, padLength: number): unknown {
    return (value + 1).toString().padStart(padLength, ' ');
  }

}
