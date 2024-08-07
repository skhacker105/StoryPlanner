import { Directive, HostListener } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { MovieService } from '../services/movie.service';
import { RecordingService } from '../services/recording.service';
import { DisplayService } from '../services/display.service';

@Directive({
  selector: '[appKeyHandler]'
})
export class KeyHandlerDirective {

  constructor(private timelineService: TimelineService,private recordingService: RecordingService, private displayService: DisplayService) { }

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
      case 'escape': this.displayService.closeDisplay.next(); break;
      case 'arrowleft': this.displayService.loadPrevItem.next(); break;
      case 'arrowright': this.displayService.loadNextItem.next(); break;
    }
  }

  playPause(): void {
    if (this.timelineService.playing) {
      this.timelineService.pause();
    } else {
      this.timelineService.play();
    }
  }
}
