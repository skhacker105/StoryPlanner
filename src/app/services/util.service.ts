import { Injectable } from '@angular/core';
import { IJSONDiff, IKeyDifference } from '../interfaces/json-diff';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  generateNewId() {
    const length = 32;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }

  cloneDeep(value: any): any {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (ex) {
      return undefined;
    }
  }

  compareJSON(obj1: any, obj2: any): IJSONDiff {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    const differences: IKeyDifference[] = [];

    for (const key of allKeys) {
      if (obj1[key] !== obj2[key] && key != 'stackPosition') {
        differences.push({ key, oldValue: obj1[key], newValue: obj2[key] });
      }
    }

    const differencesInString = '{ ' + differences.map(d =>  `${d.key}: ${d.newValue} `) + ' }';

    return { keys: Array.from(allKeys), differences, differencesInString };
  }
}
