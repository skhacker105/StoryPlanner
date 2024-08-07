import { Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FileControl } from '../../../../types/picture.type';

@Component({
  selector: 'app-vid-display',
  templateUrl: './video-display.component.html',
  styleUrl: './video-display.component.scss'
})
export class VidDisplayComponent implements OnInit, OnDestroy {
  @Input() file?: FileControl;

  @ViewChild('videoCtrl') videoCtrl?: ElementRef<HTMLVideoElement>;

  ngOnInit(): void {
    setTimeout(() => {
      this.videoCtrl?.nativeElement.play();
    }, 500);
  }

  ngOnDestroy(): void {
    this.videoCtrl?.nativeElement.pause();
  }
}
