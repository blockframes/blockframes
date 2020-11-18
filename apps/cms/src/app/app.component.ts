import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'cms-root',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'cms';
}
