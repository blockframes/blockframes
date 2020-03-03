import { ChangeDetectionStrategy, Component, Renderer2 } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { IconService } from '@blockframes/ui';

@Component({
  selector: 'delivery-root',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    renderer: Renderer2,
    theme: ThemeService,
    icons: IconService,  // even if not used in component, keep this to load icons
  ) {
    theme.initTheme(renderer, 'light');
  }
}
