import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state';
import { BucketService } from '@blockframes/contract/bucket/+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { applicationUrl } from '@blockframes/utils/apps';

@Component({
  selector: 'catalog-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MarketplaceComponent {
  public contractCount$: Observable<number>;
  public canAccessDeals = !this.orgService.org.appAccess.catalog.dashboard;
  public org$ = this.orgService.org$;
  public applicationUrl = applicationUrl;
  constructor(
    private bucketService: BucketService,
    private orgService: OrganizationService,
  ) {
    this.contractCount$ = this.bucketService.active$.pipe(
      map(bucket => bucket?.contracts.length ?? 0)
    );
  }
}
