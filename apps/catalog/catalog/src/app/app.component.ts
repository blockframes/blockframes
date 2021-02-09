import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { IconService } from '@blockframes/ui/icon.service';
import { TunnelService } from '@blockframes/ui/tunnel';

@Component({
  selector: 'catalog-root',
  template: '<router-outlet></router-outlet><cookie-banner></cookie-banner><safari-banner><safari-banner>',
  styles: [':host{ display: block; height: 100vh; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    theme: ThemeService,
    tunnelService: TunnelService, // Start listening on routes changes
    icons: IconService,  // even if not used in component, keep this to load icons
  ) {
    theme.initTheme('light');
    icons.init()
  }
}
