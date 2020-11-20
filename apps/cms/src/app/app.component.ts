import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { IconService } from '@blockframes/ui/icon-service';

@Component({
  selector: 'cms-root',
  template: '<router-outlet></router-outlet>',
  styles: [':host{ display: block; height: 100vh; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    theme: ThemeService,
    icons: IconService,  // even if not used in component, keep this to load icons
  ) {
    theme.initTheme('dark');
    icons.init()
  }
}
