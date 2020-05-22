import { Component, OnInit } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'app-logo',
  templateUrl: './app-logo.component.html',
  styleUrls: ['./app-logo.component.scss']
})
export class AppLogoComponent implements OnInit {
  public imageLogo: string;

  constructor(private routerQuery: RouterQuery) {}

  ngOnInit() {
    const appName = this.routerQuery.getData<string>('app');
    this.imageLogo = this.mapAppToImage(appName);
  }

  mapAppToImage(appName: string) {
    const appLogos = {
      catalog: 'LogoArchipelContentPrimary.svg',
      festival: 'archipel_market.png'
    };

    return appLogos[appName];
  }
}
