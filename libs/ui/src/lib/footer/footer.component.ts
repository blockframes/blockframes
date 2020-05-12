// Angular
import { Component, ChangeDetectionStrategy, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

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

export class FooterComponent implements AfterViewInit, OnDestroy {

  public logoName: string;

  public section: 'dashboard' | 'marketplace';

  private sub: Subscription;

  @ViewChild(AssetDirective) assetDirective: AssetDirective;

  constructor(private routerQuery: RouterQuery, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit() {
    // Won't work for Storybook
    this.sub = this.routerQuery.select('state').subscribe(data => {
      const app = getAppName(data.root.data.app);
      switch (app.slug) {
        case 'catalog':
          this.logoName = 'LogoArchipelContentPrimary.svg';
          this.cdr.markForCheck();
          break;
        case 'festival':
          this.logoName = 'archipel_market.png';
          this.cdr.markForCheck();
          break;
      }
      data.url.includes('marketplace') ? this.section = 'marketplace' : this.section = 'dashboard';
    })
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}