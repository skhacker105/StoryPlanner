import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioDisplayComponent } from './audio-display.component';

describe('AudioDisplayComponent', () => {
  let component: AudioDisplayComponent;
  let fixture: ComponentFixture<AudioDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AudioDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
