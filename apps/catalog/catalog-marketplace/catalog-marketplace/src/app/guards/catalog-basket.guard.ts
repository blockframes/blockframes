import { CatalogBasket } from '@blockframes/catalog-marketplace';
import { DistributionRight } from '../distribution-right/+state/basket.model';
import { OrganizationQuery } from '@blockframes/organization';
import { BasketStore } from '../distribution-right/+state/basket.store';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { FireQuery, Query, StateListGuard } from '@blockframes/utils';
import { switchMap } from 'rxjs/operators';

export const distributionRightQuery = (orgId: string): Query<CatalogBasket> => ({
  path: `orgs/${orgId}/baskets`,
  queryFn: ref => ref.where(`status`, '==', 'pending')
});
@Injectable({ providedIn: 'root' })
export class CatalogBasketGuard extends StateListGuard<CatalogBasket> {
  public params = [];
  public urlFallback = '/layout/o/catalog/home';

  constructor(
    private fireQuery: FireQuery,
    store: BasketStore,
    router: Router,
    private orgQuery: OrganizationQuery
  ) {
    super(store, router);
  }

  get query() {
    return this.orgQuery.select('org').pipe(
      switchMap(organization => {
        const query = distributionRightQuery(organization.id);
        return this.fireQuery.fromQuery<CatalogBasket[]>(query);
      })
    );
  }
}
