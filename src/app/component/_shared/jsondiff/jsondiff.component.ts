import { Component, Input } from '@angular/core';
import { IJSONDiff } from '../../../interfaces/json-diff';

@Component({
  selector: 'app-jsondiff',
  templateUrl: './jsondiff.component.html',
  styleUrl: './jsondiff.component.scss'
})
export class JSONDiffComponent {
  @Input() differences?: IJSONDiff;
}
