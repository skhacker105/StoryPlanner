import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionToolTipComponent } from './description-tool-tip.component';

describe('DescriptionToolTipComponent', () => {
  let component: DescriptionToolTipComponent;
  let fixture: ComponentFixture<DescriptionToolTipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DescriptionToolTipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DescriptionToolTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
