import { Component, ChangeDetectionStrategy, Input, Inject } from '@angular/core';
import { App } from '@blockframes/utils/apps';
import { ThemeService } from '@blockframes/ui/theme/theme.service';
import { APP } from '@blockframes/utils/routes/utils';

const appLogos: Record<App, string> = {
  catalog: 'archipel_content.svg',
  festival: 'archipel_market.svg',
  financiers: 'media_financiers.svg',
  crm: 'archipel_market.svg'
};

@Component({
  selector: 'app-logo, button[app-logo], a[app-logo]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-logo.component.html',
  styleUrls: ['./app-logo.component.scss']
})
export class AppLogoComponent {
  @Input() app = this.currentApp;
  public appLogos = appLogos;

  constructor(
    public theme: ThemeService,
    @Inject(APP) private currentApp: App
  ) { }
}
