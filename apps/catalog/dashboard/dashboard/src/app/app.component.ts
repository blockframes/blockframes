import { ChangeDetectionStrategy, Component, Renderer2 } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { IconComponent } from '@blockframes/ui';

@Component({
  selector: 'catalog-dashboard-root',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    renderer: Renderer2,
    theme: ThemeService,
    icons: IconComponent  // even if not used in component, keep this to load icons
  ) {
    theme.initTheme(renderer, 'light');
  }
}
