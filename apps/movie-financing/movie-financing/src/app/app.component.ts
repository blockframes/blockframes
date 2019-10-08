import { Component, HostListener } from '@angular/core';
import { AuthQuery } from '@blockframes/auth';
import { IconComponent } from '@blockframes/ui';

@Component({
// tslint:disable-next-line: component-selector
  selector: 'movie-financing-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  constructor(
    private query: AuthQuery,
    private icons: IconComponent // even if not used in component, keep this to load icons
  ) {
  }
}
