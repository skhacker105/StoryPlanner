import { Component } from '@angular/core';
import { MemberService } from './services/member.service';
import { MovieService } from './services/movie.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'StoryPlanner';

  constructor(public memberService: MemberService, public movieService: MovieService){}
}
