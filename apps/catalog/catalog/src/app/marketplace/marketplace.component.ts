import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { Subscription, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'catalog-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MarketplaceComponent implements OnDestroy {
  private sub: Subscription;
  public contractCount$: Observable<number>;
  public canAccessDeals = !this.orgQuery.getActive().appAccess.catalog.dashboard;
  public org$ = this.orgQuery.selectActive();

  constructor(
    private bucketQuery: BucketQuery,
    private bucketService: BucketService,
    private orgQuery: OrganizationQuery,
  ) {
    this.sub = this.orgQuery.selectActiveId().pipe(
      switchMap(id => this.bucketService.syncActive({ id }))
    ).subscribe();
    this.contractCount$ = this.bucketQuery.selectActive().pipe(
      map(bucket => bucket?.contracts.length ?? 0)
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
