import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { BucketService } from '@blockframes/contract/bucket/+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'catalog-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MarketplaceComponent {
  public contractCount$: Observable<number>;
  public canAccessDeals = !this.orgQuery.getActive().appAccess.catalog.dashboard;
  public org$ = this.orgQuery.selectActive();

  constructor(
    private bucketService: BucketService,
    private orgQuery: OrganizationQuery,
  ) {
    this.contractCount$ = this.bucketService.active$.pipe(
      map(bucket => bucket?.contracts.length ?? 0)
    );
  }
}
