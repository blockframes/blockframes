import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { MarketplaceQuery } from './+state/marketplace.query';

@Component({
  selector: 'catalog-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MarketplaceComponent {
  public cartCount$ = this.marketplaceQuery.selectCount();
  public canAccessDeals = !this.orgQuery.getActive().appAccess.catalog.dashboard;
  public org$ = this.orgQuery.selectActive();

  constructor(private marketplaceQuery: MarketplaceQuery, private orgQuery: OrganizationQuery) { }
}
