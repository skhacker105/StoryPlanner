import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent {
  @Input() layer2 = false;
  @Input() layer3 = false;
  @Input() layer4 = false;
}
