import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberOptionDisplayComponent } from './member-option-display.component';

describe('MemberOptionDisplayComponent', () => {
  let component: MemberOptionDisplayComponent;
  let fixture: ComponentFixture<MemberOptionDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemberOptionDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MemberOptionDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
