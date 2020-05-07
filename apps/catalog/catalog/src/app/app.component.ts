import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { IconService } from '@blockframes/ui/icon-service';
import { TunnelService } from '@blockframes/ui/tunnel';
import firebase from 'firebase';


@Component({
  selector: 'catalog-root',
  template: '<router-outlet></router-outlet>',
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
