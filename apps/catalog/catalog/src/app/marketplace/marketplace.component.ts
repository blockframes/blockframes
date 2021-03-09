import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { MarketplaceQuery } from './+state/marketplace.query';
import { BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'catalog-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MarketplaceComponent implements OnDestroy {
  private sub: Subscription;
  public cartCount$ = this.marketplaceQuery.selectCount();
  public canAccessDeals = !this.orgQuery.getActive().appAccess.catalog.dashboard;
  public org$ = this.orgQuery.selectActive();

  constructor(
    private bucketQuery: BucketQuery,
    private bucketService: BucketService,
    private marketplaceQuery: MarketplaceQuery,
    private orgQuery: OrganizationQuery,
  ) {
    // this.sub = this.orgQuery.selectActiveId().pipe(
    //   switchMap(id => this.bucketService.syncActive({ id }))
    // ).subscribe();
  }

  ngOnDestroy() {
    // this.sub.unsubscribe();
  }
}
