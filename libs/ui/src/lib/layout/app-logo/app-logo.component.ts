import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';

const appLogos = {
  catalog: 'LogoArchipelContentPrimary.svg',
  festival: 'logo_archipel_market_home.svg'
};

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-logo.component.html',
  styleUrls: ['./app-logo.component.scss']
})
export class AppLogoComponent implements OnInit {
  public imageLogo: string;

  constructor(private routerQuery: RouterQuery) {}

  ngOnInit() {
    const appName = this.routerQuery.getData<string>('app');
    this.imageLogo = appLogos[appName];
  }
}
