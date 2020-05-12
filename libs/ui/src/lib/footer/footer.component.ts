// Angular
import { Component, ChangeDetectionStrategy, OnDestroy, ViewChild } from '@angular/core';

// Blockframes
import { getAppName } from '@blockframes/utils/apps';
import { AssetDirective } from '../theme/img-asset.directive';

// Libs
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bf-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FooterComponent implements OnDestroy {

  private sub: Subscription;

  @ViewChild(AssetDirective) assetDirective: AssetDirective;

  constructor(private routerQuery: RouterQuery) {
    // Won't work for Storybook
    this.sub = this.routerQuery.select('state').subscribe(data => {
      const app = getAppName(data.root.data.app);
      switch (app.slug) {
        case 'catalog':
          this.assetDirective.asset = 'archipel_market.png';
          break;
        case 'festival':
          this.assetDirective.asset = 'LogoArchipelContentPrimary.svg';
          this.assetDirective.type = 'logo';
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}