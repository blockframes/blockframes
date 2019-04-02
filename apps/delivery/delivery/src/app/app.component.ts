import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'delivery-root',
  template: `<router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
