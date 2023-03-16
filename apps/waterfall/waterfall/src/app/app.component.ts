import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { TunnelService } from '@blockframes/ui/tunnel';
import { IconService } from '@blockframes/ui/icon.service';

@Component({
  selector: 'waterfall-root',
  template: '<router-outlet></router-outlet><cookie-banner></cookie-banner><app-version></app-version>',
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
    icons.init();
  }
}
