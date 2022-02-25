import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { App } from '@blockframes/utils/apps';
import { ThemeService } from '@blockframes/ui/theme/theme.service';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

const appLogos: Record<App | 'crm', string> = {
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
  @Input() app = this.appGuard.currentApp;
  public appLogos = appLogos;

  constructor(
    private appGuard: AppGuard,
    public theme: ThemeService
  ) {}
}
