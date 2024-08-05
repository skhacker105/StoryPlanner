import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioIconComponent } from './audio-icon.component';

describe('AudioIconComponent', () => {
  let component: AudioIconComponent;
  let fixture: ComponentFixture<AudioIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AudioIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
