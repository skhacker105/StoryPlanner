import { Pipe, PipeTransform } from '@angular/core';
import { SortType } from '../types/sort.type';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(values: any[], sortBy: SortType): any[] {
    return values.sort((a: any, b: any) => this.compareValues(a, b, sortBy));
  }

  compareValues(a: any, b: any, sortBy: SortType): number {
    let diff = 0;
    switch(sortBy) {

      case 'byName':
        diff = a['name'].localeCompare(b['name']);
        break;

      case 'byTime':
        diff = b['name'].localeCompare(a['name']);
        break;
    }
    return diff;
  }

}
