import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-description-tool-tip',
  templateUrl: './description-tool-tip.component.html',
  styleUrl: './description-tool-tip.component.scss'
})
export class DescriptionToolTipComponent {

  @Input() data: any;
  @Input() contentTemplate: TemplateRef<any> | undefined;
}
