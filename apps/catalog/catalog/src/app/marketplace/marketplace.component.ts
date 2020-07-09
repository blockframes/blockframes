import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MarketplaceQuery } from './+state/marketplace.query';

@Component({
  selector: 'catalog-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MarketplaceComponent {
  public cartCount$ = this.marketplaceQuery.selectCount();

  constructor(private marketplaceQuery: MarketplaceQuery) {}
}
