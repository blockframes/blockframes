import { Component, TemplateRef, ViewChild, Directive, ViewEncapsulation } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  `],
  encapsulation: ViewEncapsulation.None,
  animations: [fade]
})
export class OverlayWidgetComponent {
  @ViewChild('ref', { static: false }) public ref: TemplateRef<any>;
}


// CARD
@Directive({
  selector: `widget-card, [widgetCard]`,
  host: {
    'class': 'widget-card'
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

