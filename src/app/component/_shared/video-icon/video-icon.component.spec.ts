import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoIconComponent } from './video-icon.component';

describe('VideoIconComponent', () => {
  let component: VideoIconComponent;
  let fixture: ComponentFixture<VideoIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VideoIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideoIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
