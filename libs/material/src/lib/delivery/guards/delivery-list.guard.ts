import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { DeliveryStore, Delivery, modifyTimestampToDate, DeliveryDB } from '../+state';
import { switchMap, map } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie';
import { combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const deliveryQuery = (deliveryId: string): Query<DeliveryDB> => ({
  path: `deliveries/${deliveryId}`,
  stakeholders: delivery => ({
    path: `deliveries/${delivery.id}/stakeholders`,
    organization: stakeholder => ({
      path: `orgs/${stakeholder.id}`
    })
  })
});

@Injectable({ providedIn: 'root' })
export class DeliveryListGuard extends StateListGuard<Delivery> {
  public get urlFallback() {
    return `layout/o/${this.movieQuery.getActiveId()}/template-picker`;
  }

  constructor(
    private fireQuery: FireQuery,
    private movieQuery: MovieQuery,
    store: DeliveryStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    return this.movieQuery
      .selectActive(movie => movie.deliveryIds)
      .pipe(
        switchMap(ids => {
          if (!ids || ids.length === 0) throw new Error('No Delivery yet');
          const queries = ids.map(id => {
            return this.fireQuery.fromQuery<DeliveryDB>(deliveryQuery(id)).pipe(
              catchError(e => {
                // TODO: Only catch NotFoundError
                return of(undefined);
              })
            );
          });
          return combineLatest(queries);
        }),
        map(deliveries =>
          deliveries.filter(x => !!x).map(delivery => modifyTimestampToDate(delivery))
        )
      );
  }
}
