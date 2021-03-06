import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App } from '@blockframes/utils/apps';
import { ThemeService } from '@blockframes/ui/theme/theme.service';

const appLogos: Record<App | 'crm', string> = {
  catalog: 'archipel_content.svg',
  festival: 'archipel_market.svg',
  financiers: 'media_financiers.svg',
  crm: 'archipel_market.svg'
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
