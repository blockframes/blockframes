import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { AuthQuery } from '@blockframes/auth';
import { IconComponent } from '@blockframes/ui';

@Component({
  selector: 'delivery-root',
  template: `
    <router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    private query: AuthQuery,
    private icons: IconComponent  // even if not used in component, keep this to load icons
  ) {
  }
}
