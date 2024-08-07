import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FileControl } from '../../../../types/picture.type';

@Component({
  selector: 'app-audio-display',
  templateUrl: './audio-display.component.html',
  styleUrl: './audio-display.component.scss'
})
export class AudioDisplayComponent implements OnInit, OnDestroy {
  @Input() file?: FileControl;

  @ViewChild('audioCtrl') audioCtrl?: ElementRef<HTMLAudioElement>;

  ngOnInit(): void {
    setTimeout(() => {
      this.audioCtrl?.nativeElement.play();
    }, 500);
  }

  ngOnDestroy(): void {
    this.audioCtrl?.nativeElement.pause();
  }
}
