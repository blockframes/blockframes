import { Directive, Input, HostListener, ElementRef, Renderer2, HostBinding, ComponentRef } from '@angular/core';
import { OverlayWidgetComponent } from './overlay-widget.component';
import { Subscription } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { OverlayRef, Overlay, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

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
  // open = true;
  private _passiveListeners = new Map<string, EventListenerOrEventListenerObject>();
  private _touchstartTimeout: number;
  private sub: Subscription
  private overlayRef: OverlayRef;

  @Input() widgetTooltip: OverlayWidgetComponent;
  @HostListener('mouseenter') onMouseEnter() {
      this.widgetTooltip.open(this.el);
    // const tooltipRef: ComponentRef<OverlayWidgetComponent>
    // = this.overlayRef.attach(new ComponentPortal(OverlayWidgetComponent));
    // tooltipRef.instance.open(this.el)
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.widgetTooltip.close();
    // setTimeout(() => {
    //   this.widgetTooltip.close();
    // }, 100000)
    // this.overlayRef.detach();
  }


  // @HostBinding('style.pointer-events')
  // pointerEvents:string = 'none';

  constructor(private overlay: Overlay,
    private overlayPositionBuilder: OverlayPositionBuilder,
    private el: ElementRef, private focusMonitor: FocusMonitor) {}

  // ngOnInit() {
  //   // this.sub = this.focusMonitor.monitor(this.el).subscribe(origin => {
  //   //   origin ? console.log('open') : console.log('close');
  //   // })

  //   const positionStrategy = this.overlayPositionBuilder
  //   .flexibleConnectedTo(this.el)
  //   .withPositions([{
  //     originX: 'center',
  //     originY: 'bottom',
  //     overlayX: 'center',
  //     overlayY: 'top',
  //     offsetY: -20,
  //   }]);

  // this.overlayRef = this.overlay.create({ positionStrategy });

  // }
  // ngOnDestroy() {
  //   this.sub.unsubscribe();
  // }

}