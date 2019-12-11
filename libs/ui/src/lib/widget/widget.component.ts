import { Component, TemplateRef, ViewChild } from '@angular/core';
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
  selector: 'bf-widget',
  template: `
  <ng-template #ref>
    <div tabindex="-1" role="menu" @fade class="bf-widget">
      <ng-content></ng-content>
    </div>
  </ng-template>
`,
animations: [fade]
})
export class WidgetComponent {
  @ViewChild('ref', { static: false }) public ref: TemplateRef<any>;
}
