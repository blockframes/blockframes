import { OrganizationQuery } from '@blockframes/organization';
import { BasketStore } from '../distribution-right/+state/basket.store';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { FireQuery, Query, StateListGuard } from '@blockframes/utils';
import { CatalogBasket } from '../distribution-right/+state';
import { switchMap } from 'rxjs/operators';

export const catalogBasketQuery = (orgId: string): Query<CatalogBasket> => ({
  path: `baskets`,
  queryFn: ref => ref.where(`orgId`, '==', orgId)
});
@Injectable({ providedIn: 'root' })
export class CatalogBasketGuard extends StateListGuard<CatalogBasket> {
  public params = ['basketId'];
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
        const query = catalogBasketQuery(organization.id);
        return this.fireQuery.fromQuery<CatalogBasket[]>(query);
      })
    );
  }
}
