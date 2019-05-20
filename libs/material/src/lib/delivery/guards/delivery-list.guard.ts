import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { DeliveryStore, Delivery, modifyTimestampToDate, DeliveryDB } from '../+state';
import { switchMap, map } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie';


const deliveryQuery = (movieId: string): Query<DeliveryDB[]> => ({
  path: `deliveries`,
  queryFn: ref => ref.where('movieId', '==', movieId),
  stakeholders: delivery => ({
    path: `deliveries/${delivery.id}/stakeholders`,
    organization: stakeholder => ({
      path: `orgs/${stakeholder.orgId}`
    })
  })
});

@Injectable({ providedIn: 'root' })
export class DeliveryListGuard extends StateListGuard<Delivery> {
  urlFallback = 'layout';

  constructor(
    private fireQuery: FireQuery,
    private movieQuery: MovieQuery,
    store: DeliveryStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    return this.movieQuery.selectActiveId().pipe(
      switchMap(movieId => {
        const query = deliveryQuery(movieId);
        return this.fireQuery.fromQuery<DeliveryDB[]>(query);
      }),
      map(deliveries => deliveries.map(delivery =>
        modifyTimestampToDate(delivery)))
    );
  }
}
