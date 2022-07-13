import { Component, ChangeDetectionStrategy, Input, Inject } from '@angular/core';
import { App } from '@blockframes/model';
import { ThemeService } from '../../theme/theme.service';
import { APP } from '@blockframes/utils/routes/utils';

const appLogos: Record<App, string> = {
  catalog: 'archipel_content_icon.svg',
  festival: 'archipel_market_icon.svg',
  financiers: 'media_financiers_icon.svg',
  crm: 'archipel_market_icon.svg'
};

@Component({
  selector: 'app-logo-icon, button[app-logo-icon], a[app-logo-icon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-logo-icon.component.html',
  styleUrls: ['./app-logo-icon.component.scss']
})
export class AppLogoIconComponent {
  @Input() app = this.currentApp;
  public appLogos = appLogos;

  constructor(
    public theme: ThemeService,
    @Inject(APP) private currentApp: App
  ) { }
}
