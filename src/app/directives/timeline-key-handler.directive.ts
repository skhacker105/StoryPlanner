import { Directive, HostListener } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { MovieService } from '../services/movie.service';

@Directive({
  selector: '[appTimelineKeyHandler]'
})
export class TimelineKeyHandlerDirective {

  constructor(private timelineService: TimelineService, private movieService: MovieService) { }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    switch(event.key.toLowerCase()) {
      case '+': this.timelineService.increaseTime(); break;
      case '-': this.timelineService.decreaseTime(); break;
      case 'home': this.timelineService.timeToZero(); break;
      case 'end': this.timelineService.timeToEnd(); break;
      case ' ': this.playPause();
    }
  }

  playPause(): void {
    if (this.timelineService.playing) {
      this.timelineService.pause();
    } else {
      this.timelineService.setMaxPlayTime(this.movieService.maxPlayTime);
      this.timelineService.play();
    }
  }
}
