import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'animationPause',
  pure: true
})
export class AnimationPausePipe implements PipeTransform {

  transform(animationPausedForCapture: boolean): unknown {
    return animationPausedForCapture ? `animation-play-state: paused !important; ` : ' ';
  }

}
