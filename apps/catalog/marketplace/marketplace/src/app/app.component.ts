import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { AuthQuery } from '@blockframes/auth';
import { IconComponent } from '@blockframes/ui';

@Component({
  selector: 'catalog-root',
  template: `<router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    private query: AuthQuery,
    private icons: IconComponent // even if not used in component, keep this to load icons
  ) {
  }

  @HostListener('window:beforeunload', ['$event'])
  closeProtection($event: any) {
    if (this.query.getValue().isEncrypting) {
      $event.returnValue = 'Some critical data are still being processed and will be lost forever if you leave now !';
    }
  }
}
