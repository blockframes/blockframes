import { OrganizationQuery } from '@blockframes/organization';
import { BasketStore } from '../distribution-right/+state/basket.store';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { CatalogBasket } from '../distribution-right/+state';
import { switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { BasketQuery } from '../distribution-right/+state/basket.query';

export const catalogBasketQuery = (id: string): Query<CatalogBasket[]> => ({
  path: `orgs/${id}/catalog`
});

@Injectable({ providedIn: 'root' })
export class CatalogBasketGuard extends StateListGuard<CatalogBasket> {
  public urlFallback = '/layout/o/catalog/home';

  constructor(
    private fireQuery: FireQuery,
    store: BasketStore,
    router: Router,
    private organizationQuery: OrganizationQuery,
    private basketQuery: BasketQuery
  ) {
    super(store, router);
  }

  get query() {
    return this.basketQuery
      .select(state => state)
      .pipe(
        switchMap(entities => {
          if (!entities.right) throw new Error('No distribution rights yet');
          const query = this.fireQuery.fromQuery<CatalogBasket>(
            catalogBasketQuery(this.organizationQuery.getValue().org.id)
          );
          return combineLatest([query]);
        })
      );
  }
}
