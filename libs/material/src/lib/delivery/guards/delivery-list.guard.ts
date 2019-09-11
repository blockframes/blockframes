import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { DeliveryStore, Delivery, modifyTimestampToDate, DeliveryDB } from '../+state';
import { switchMap, map } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie';
import { combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// TODO: add a stakeholderIds in delivery so we can filter them here. => ISSUE#639
// e. g. queryFn: ref => ref.where('stakeholderIds', 'array-contains', userOrgId)
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
    return `layout/o/delivery/add/${this.movieQuery.getActiveId()}/2-choose-starter`;
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
          if (!ids || ids.length === 0) return of([]);
          const queries = ids.map(id => {
            return this.fireQuery.fromQuery<DeliveryDB>(deliveryQuery(id)).pipe(
              catchError(e => {
                // TODO: Only catch NotFoundError => ISSUE#627
                return of(undefined);
              })
            );
          });
          return combineLatest(queries);
        }),
        map((deliveries: DeliveryDB[]) => {
          if (deliveries.length === 0) throw new Error('There is no deliveries');
          return deliveries
            .filter(delivery => !!delivery)
            .map((delivery: DeliveryDB) => modifyTimestampToDate(delivery));
        })
      );
  }
}
