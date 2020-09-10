import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App } from '@blockframes/utils/apps';

const appLogos: Record<App | 'crm', string> = {
  catalog: 'LogoArchipelContentPrimary.svg',
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

  @Input() theme: 'dark' | 'light';

  constructor(private routerQuery: RouterQuery) {}

  ngOnInit() {
    const appName = this.routerQuery.getData<string>('app');
    this.imageLogo = appLogos[appName];
  }
}
