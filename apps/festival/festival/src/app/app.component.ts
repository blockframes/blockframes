import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { TunnelService } from '@blockframes/ui/tunnel';
import { IconService } from '@blockframes/ui';
import { YandexMetricaService } from '@blockframes/utils';

@Component({
  selector: 'festival-root',
  template: '<router-outlet></router-outlet>',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    theme: ThemeService,
    tunnelService: TunnelService, // Start listening on routes changes
    icons: IconService,  // even if not used in component, keep this to load icons
    ym: YandexMetricaService // Need to be instantiate
  ) {
    theme.initTheme('dark');
  }
}
