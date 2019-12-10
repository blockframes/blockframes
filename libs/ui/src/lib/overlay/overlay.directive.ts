import { Directive, Input, TemplateRef, HostListener, ViewContainerRef, ElementRef } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Directive({
  selector: "[widgetTarget]"
})
export class WidgetDirective {
  @Input() widgetTarget: TemplateRef<any>;
  @HostListener('click')
    open() {
      const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      }]);
      const overlayRef = this.overlay.create({
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop',
        positionStrategy
      });
      const widget = new TemplatePortal(this.widgetTarget, this.viewContainerRef);
      overlayRef.attach(widget);
      overlayRef.backdropClick().subscribe(() => overlayRef.detach());
    }
constructor(
  private overlay : Overlay,
  private viewContainerRef: ViewContainerRef,
  private _elementRef: ElementRef
){}
}
