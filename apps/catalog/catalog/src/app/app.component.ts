import { ChangeDetectionStrategy, Component, Renderer2 } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { IconService } from '@blockframes/ui/icon-service';
import { TunnelService } from '@blockframes/ui/tunnel';

@Component({
  selector: 'catalog-root',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    renderer: Renderer2,
    theme: ThemeService,
    tunnelService: TunnelService, // Start listening on routes changes
    icons: IconService  // even if not used in component, keep this to load icons
  ) {
    theme.initTheme(renderer, 'light');
  }
}
