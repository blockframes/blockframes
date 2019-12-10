import { Directive, Input, TemplateRef, HostListener, ViewContainerRef, ElementRef } from '@angular/core';
import { Overlay, BlockScrollStrategy, ViewportRuler, NoopScrollStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { WidgetComponent } from './widget.component';

@Directive({
  selector: "[widgetTarget]"
})

export class WidgetDirective {
  @Input() widgetTarget: WidgetComponent;
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
        positionStrategy,
        scrollStrategy: new NoopScrollStrategy(),
        // maxHeight: '10px'
      });
      const widget = new TemplatePortal(this.widgetTarget.ref, this.viewContainerRef);  // Use the template ref of the widget component instead.
      overlayRef.attach(widget);
      overlayRef.backdropClick().subscribe(() => overlayRef.detach());
    }
constructor(
  private overlay : Overlay,
  private viewContainerRef: ViewContainerRef,
  private _elementRef: ElementRef,
  private _viewportRuler: ViewportRuler
){}
}
