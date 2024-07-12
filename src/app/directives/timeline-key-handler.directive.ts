import { Directive, HostListener } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { MovieService } from '../services/movie.service';
import { RecordingService } from '../services/recording.service';

@Directive({
  selector: '[appTimelineKeyHandler]'
})
export class TimelineKeyHandlerDirective {

  constructor(private timelineService: TimelineService, private movieService: MovieService, private recordingService: RecordingService) { }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    switch(event.key.toLowerCase()) {
      case '+': this.timelineService.increaseTime(); break;
      case '-': this.timelineService.decreaseTime(); break;
      case 'home': this.timelineService.timeToZero(); break;
      case 'end': this.timelineService.timeToEnd(); break;
      case ' ': !this.recordingService.recording.value ? this.playPause() : this.recordingService.stopRecording(); break;
      case 'r':
        event.altKey ? this.recordingService.toggleRecording() : null;
        break;
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
