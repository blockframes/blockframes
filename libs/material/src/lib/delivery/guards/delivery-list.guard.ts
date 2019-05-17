import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { DeliveryStore, Delivery } from '../+state';
import { switchMap } from 'rxjs/operators';
import { MovieQuery, Stakeholder } from '@blockframes/movie';
import { Organization } from '@blockframes/organization';

const deliveryQuery = (movieId: string): Query<Delivery[]> => ({
  path: `deliveries`,
  queryFn: ref => ref.where('movieId', '==', movieId),
  stakeholders: (delivery: Delivery): Query<Stakeholder> => ({
    path: `deliveries/${delivery.id}/stakeholders`,
    organization: (stakeholder: Stakeholder): Query<Organization> => ({
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
        return this.fireQuery.fromQuery<Delivery[]>(query);
      })
    );
  }
}
