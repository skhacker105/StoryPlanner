import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JSONDiffComponent } from './jsondiff.component';

describe('JSONDiffComponent', () => {
  let component: JSONDiffComponent;
  let fixture: ComponentFixture<JSONDiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JSONDiffComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JSONDiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
