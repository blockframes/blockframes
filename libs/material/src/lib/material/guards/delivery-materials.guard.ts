import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { MaterialStore, Material } from '../+state';
import { switchMap } from 'rxjs/operators';
import { DeliveryQuery } from '../../delivery/+state';
import { MovieQuery } from '@blockframes/movie';

const deliveryMaterialsQuery = (deliveryId: string, movieId: string): Query<Material[]> => ({
  path: `movies/${movieId}/materials`,
  queryFn: ref => ref.where('deliveriesIds', 'array-contains', deliveryId)
});

@Injectable({ providedIn: 'root' })
export class DeliveryMaterialsGuard extends StateListGuard<Material> {
  urlFallback = 'layout';

  constructor(
    private fireQuery: FireQuery,
    private deliveryQuery: DeliveryQuery,
    private movieQuery: MovieQuery,
    store: MaterialStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    const movieId = this.movieQuery.getActiveId();
    return this.deliveryQuery.selectActive().pipe(
      switchMap(delivery => {
        const query = deliveryMaterialsQuery(delivery.id, movieId);
        return this.fireQuery.fromQuery<Material[]>(query)
      })
    );
  }
}
