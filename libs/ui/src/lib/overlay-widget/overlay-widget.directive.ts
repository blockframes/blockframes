import { Directive, Input, HostListener, ElementRef } from '@angular/core';
import { OverlayWidgetComponent } from './overlay-widget.component';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Subscription } from 'rxjs';

// OVERLAY TRIGGERED ON CLICK
@Directive({ selector: "button[widgetTarget]" })
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
    this.widgetTarget.close();
  }

  constructor(private el: ElementRef) {}
}

// OVERLAY TRIGGERED ON Hover
@Directive({ selector: "[widgetTooltip]" })
export class OverlayWidgetTooltipDirective {

  @Input() widgetTooltip: OverlayWidgetComponent;
  @HostListener('mouseenter') onMouseEnter() {
    this.widgetTooltip.open(this.el);
  }
  // TODO##1958 update widgetTooltip to listen to mouseleave event
  // @HostListener('mouseleave') onMouseLeave() {
  //   setTimeout(() => {
  //     this.widgetTooltip.close();
  //   }, 1000)
  // }

  constructor(private el: ElementRef) {}
}