import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { TunnelService } from '@blockframes/ui/tunnel';
import { IconService } from '@blockframes/ui/icon-service';
import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';

@Component({
  selector: 'festival-root',
  template: '<router-outlet></router-outlet><cookie-banner></cookie-banner><safari-banner><safari-banner>',
  styles: [':host{ display: block; height: 100vh; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    theme: ThemeService,
    tunnelService: TunnelService, // Start listening on routes changes
    icons: IconService,  // even if not used in component, keep this to load icons
    ym: YandexMetricaService // Need to be instantiate
  ) {
    theme.initTheme('light');
    icons.init()
  }
}
