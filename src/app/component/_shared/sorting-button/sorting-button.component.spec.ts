import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingButtonComponent } from './sorting-button.component';

describe('SortingButtonComponent', () => {
  let component: SortingButtonComponent;
  let fixture: ComponentFixture<SortingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SortingButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SortingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
