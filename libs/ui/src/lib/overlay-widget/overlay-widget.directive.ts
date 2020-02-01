import { Directive, Input, HostListener, ElementRef } from '@angular/core';
import { OverlayWidgetComponent } from './overlay-widget.component';

// OVERLAY TRIGGERED ON CLICK
@Directive({ selector: "a[widgetTarget], button[widgetTarget]" })
export class OverlayWidgetButtonDirective {

  @Input() widgetTarget: OverlayWidgetComponent;
  @HostListener('click') onclick() {
    this.widgetTarget.open(this.el);
  }
  constructor(private el: ElementRef) {}
}

// OVERLAY TRIGGERED ON FOCUS / CLOSED ON BLUT
@Directive({ selector: "input[widgetTarget]" })
export class OverlayWidgetInputDirective {
  
  @Input() widgetTarget: OverlayWidgetComponent;
  @HostListener('focus') onfocus() {
    this.widgetTarget.open(this.el);
  }
  @HostListener('blur') onblur() {
    this.widgetTarget.open(this.el);
  }

  constructor(private el: ElementRef) {}
}
