import { Directive, Input, HostListener, ViewContainerRef, ElementRef, OnDestroy } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { OverlayWidgetComponent } from './overlay-widget.component';

export class OverlayWidgetBase implements OnDestroy{
  private overlayRef: OverlayRef;
  private widget: TemplatePortal;
  private opened = false;

  @Input() widgetTarget: OverlayWidgetComponent;
  @HostListener('click') onclick() {
    this.open();
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
  open() {
    if (this.opened) {
      return;
    }
    this.opened = true;
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
      this.overlayRef.backdropClick().subscribe(() => this.close());
    }
    this.overlayRef.attach(this.widget);
  }

  close() {
    if (this.overlayRef && this.opened) {
      this.opened = false;
      this.overlayRef.detach();
    }
  }
}

// OVERLAY TRIGGERED ON CLICK
@Directive({ selector: "a[widgetTarget], button[widgetTarget]" })
export class OverlayWidgetButtonDirective extends OverlayWidgetBase {

  @HostListener('click') onclick() {
    this.open();
  }

  constructor(overlay : Overlay, viewContainerRef: ViewContainerRef, el: ElementRef) {
    super(overlay, viewContainerRef, el);
  }
}

// OVERLAY TRIGGERED ON FOCUS / CLOSED ON BLUT
@Directive({ selector: "input[widgetTarget]" })
export class OverlayWidgetInputDirective extends OverlayWidgetBase {

  @HostListener('focus') onfocus() {
    this.open();
  }
  @HostListener('blur') onblur() {
    this.open();
  }

  constructor(overlay : Overlay, viewContainerRef: ViewContainerRef, el: ElementRef) {
    super(overlay, viewContainerRef, el);
  }
}
