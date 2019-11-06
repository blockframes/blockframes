import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthQuery } from '@blockframes/auth';
import { IconComponent } from '@blockframes/ui';
import { NgxMetrikaService } from '@kolkov/ngx-metrika';

@Component({
  selector: 'catalog-root',
  template: `<router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    private query: AuthQuery,
    private icons: IconComponent, // even if not used in component, keep this to load icons
    private ym: NgxMetrikaService // needs to be initialized in the root component
  ) {
  }
}
