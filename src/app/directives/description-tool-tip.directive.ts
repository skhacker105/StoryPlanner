import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { DescriptionToolTipComponent } from '../component/_shared/description-tool-tip/description-tool-tip.component';

@Directive({
  selector: '[appDescriptionToolTip]'
})
export class DescriptionToolTipDirective implements OnInit, OnDestroy {

  @Input() showToolTip: boolean = true;
  @Input() data: any;
  @Input() contentTemplate: TemplateRef<any> | undefined;

  private _overlayRef: OverlayRef | undefined;

  constructor(
    private _overlay: Overlay,
    private _overlayPositionBuilder: OverlayPositionBuilder,
    private _elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    if (!this.showToolTip) {
      return;
    }

    const positionStrategy = this._overlayPositionBuilder
                                 .flexibleConnectedTo(this._elementRef)
                                 .withPositions([{
                                                    originX: 'center',
                                                    originY: 'bottom',
                                                    overlayX: 'center',
                                                    overlayY: 'top',
                                                }]);

    this._overlayRef = this._overlay.create({ positionStrategy});
  }

  ngOnDestroy() {
    this.closeToolTip();
  }

  @HostListener('mouseenter')
  show() {

    //attach the component if it has not already attached to the overlay
    if (this._overlayRef && !this._overlayRef.hasAttached()) {
      const tooltipRef: ComponentRef<DescriptionToolTipComponent> = this._overlayRef.attach(new ComponentPortal(DescriptionToolTipComponent));
      tooltipRef.instance.data = this.data;
      tooltipRef.instance.contentTemplate = this.contentTemplate;
    }    
  }

  @HostListener('mouseleave')
  hide() {
    this.closeToolTip();
  }

  private closeToolTip() {
    if (this._overlayRef) {
      this._overlayRef.detach();
    }
  }

}
