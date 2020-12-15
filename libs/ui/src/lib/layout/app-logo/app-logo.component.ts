import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App } from '@blockframes/utils/apps';
import { ThemeService } from '@blockframes/ui/theme/theme.service';

const appLogos: Record<App | 'crm', string> = {
  catalog: 'archipel_content_logo.svg',
  festival: 'logo_archipel_market_outline.svg',
  financiers: 'logo_media_financiers.svg',
  crm: 'logo_archipel_market_outline.svg' // @TODO (#3081) change logo
};

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-logo.component.html',
  styleUrls: ['./app-logo.component.scss']
})
export class AppLogoComponent implements OnInit {
  public imageLogo: string;

  constructor(
    private routerQuery: RouterQuery,
    public theme: ThemeService
  ) {}

  ngOnInit() {
    const appName = this.routerQuery.getData<string>('app');
    this.imageLogo = appLogos[appName];
  }
}
