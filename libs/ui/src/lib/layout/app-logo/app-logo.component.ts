import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { App, getCurrentApp } from '@blockframes/utils/apps';
import { ThemeService } from '@blockframes/ui/theme/theme.service';
import { ActivatedRoute } from '@angular/router';

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
  @Input() app = getCurrentApp(this.route);
  public appLogos = appLogos;

  constructor(
    private route: ActivatedRoute,
    public theme: ThemeService
  ) {}
}
