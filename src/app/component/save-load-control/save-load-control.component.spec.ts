import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveLoadControlComponent } from './save-load-control.component';

describe('SaveLoadControlComponent', () => {
  let component: SaveLoadControlComponent;
  let fixture: ComponentFixture<SaveLoadControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveLoadControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaveLoadControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
