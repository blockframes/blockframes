import { Component, TemplateRef, ViewChild, Directive, ViewEncapsulation, ViewContainerRef, OnDestroy, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

const fade = trigger('fade', [
  state('void', style({
    opacity: 0,
    transform: 'scale(0.8)'
  })),
  transition(':enter',  animate('120ms cubic-bezier(0, 0, 0.2, 1)', style({transform: 'scale(1)', opacity: 1}))),
  transition(':leave', animate('100ms 25ms linear', style({transform: 'scale(1.1)', opacity: 0})))
]);



@Component({
  selector: 'overlay-widget',
  template: `
  <ng-template #ref>
    <div tabindex="-1" role="menu" @fade class="bf-widget">
      <ng-content></ng-content>
    </div>
  </ng-template>
  `,
  styles: [`
    .bf-widget:focus {
      outline: none;
    }
  `,`
    .widget-card {
      display: block;
      border-radius: 4px;
    }
  `, `
    .widget-header {
      display: block;
      border-radius: 4px 4px 0 0;
      padding: 16px;
    }
  `, `
    .widget-footer {
      display: block;
      border-radius: 0 0 4px 4px;
    }
    .widget-footer .mat-button {
        padding: 16px;
        width: 100%;
      }
  `],
  encapsulation: ViewEncapsulation.None,
  animations: [fade]
})
export class OverlayWidgetComponent implements OnDestroy {
  @ViewChild('ref', { static: false }) public ref: TemplateRef<any>;
  private overlayRef: OverlayRef;
  private widgetPortal: TemplatePortal;
  private opened = false;
  
  constructor(
    private overlay : Overlay,
    private viewContainerRef: ViewContainerRef,
  ){}

  // Destroy the reference from the DOM if it exists and clean up overlayRef
  ngOnDestroy() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      delete this.overlayRef;
    }
  }

  open(connectedTo: ElementRef) {
    if (this.opened) {
      return;
    }
    this.opened = true;
    if (!this.overlayRef) {
      const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(connectedTo)
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
      this.widgetPortal = new TemplatePortal(this.ref, this.viewContainerRef);
      this.overlayRef.backdropClick().subscribe(() => this.close());
    }
    this.overlayRef.attach(this.widgetPortal);
  }

  close() {
    if (this.overlayRef && this.opened) {
      this.opened = false;
      this.overlayRef.detach();
    }
  }
}


// CARD
@Directive({
  selector: `widget-card, [widgetCard]`,
  host: {
    'class': 'widget-card',
  }
})
export class WidgetCardDirective {}

// HEADER
@Directive({
  selector: `widget-header, [widgetHeader]`,
  host: {
    'class': 'widget-header'
  }
})
export class WidgetHeaderDirective {}


// FOOTER
@Directive({
  selector: `widget-footer, [widgetFooter]`,
  host: {
    'class': 'widget-footer'
  }
})
export class WidgetFooterDirective {}

