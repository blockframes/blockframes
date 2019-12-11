import { Directive, Input, HostListener, ViewContainerRef, ElementRef, OnDestroy } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { WidgetComponent } from './widget.component';

@Directive({
  selector: "[widgetTarget]"
})

export class WidgetDirective implements OnDestroy{
  private overlayRef: OverlayRef;
  private widget: TemplatePortal;

  @Input() widgetTarget: WidgetComponent;
  @HostListener('click')
    open() {
      if (!this.overlayRef) {
        const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(this._elementRef)
        .withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }]);
        this.overlayRef = this.overlay.create({
          hasBackdrop: true,
          backdropClass: 'cdk-overlay-transparent-backdrop',
          positionStrategy,
        });
        this.widget = new TemplatePortal(this.widgetTarget.ref, this.viewContainerRef);
        this.overlayRef.backdropClick().subscribe(() => this.overlayRef.detach());
      }

      this.overlayRef.attach(this.widget);
    }
constructor(
  private overlay : Overlay,
  private viewContainerRef: ViewContainerRef,
  private _elementRef: ElementRef,
){}

// Destroy the reference from the DOM if it exists and clean up overlayRef
ngOnDestroy() {
  if (this.overlayRef) {
    this.overlayRef.dispose();
    delete this.overlayRef;
  }
}

}
