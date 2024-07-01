import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerDisplayComponent } from './layer-display.component';

describe('LayerDisplayComponent', () => {
  let component: LayerDisplayComponent;
  let fixture: ComponentFixture<LayerDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayerDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LayerDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
