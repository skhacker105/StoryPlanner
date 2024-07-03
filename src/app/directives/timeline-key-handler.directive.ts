import { Directive, HostListener } from '@angular/core';
import { TimelineService } from '../services/timeline.service';

@Directive({
  selector: '[appTimelineKeyHandler]'
})
export class TimelineKeyHandlerDirective {

  constructor(private timelineService: TimelineService) { }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    switch(event.key.toLowerCase()) {
      case '+': this.timelineService.increaseTime(); break;
      case '-': this.timelineService.decreaseTime(); break;
      case 'home': this.timelineService.timeToZero(); break;
      case 'end': this.timelineService.timeToEnd(); break;
      case ' ': this.timelineService.playing ? this.timelineService.pause() : this.timelineService.play();
    }
  }
}
