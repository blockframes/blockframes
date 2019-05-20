import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { MaterialStore, Material } from '../+state';
import { switchMap, map } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie';
import { DeliveryQuery } from '../../delivery/+state';

const deliveryMovieMaterialsQuery = (movieId: string, deliveryId: string): Query<Material[]> => ({
  path: `movies/${movieId}/materials`,
  queryFn: ref => ref.where('deliveriesIds', 'array-contains', deliveryId)
});

@Injectable({ providedIn: 'root' })
export class MovieMaterialsByDeliveryGuard extends StateListGuard<Material> {
  urlFallback = 'layout';

  constructor(
    private fireQuery: FireQuery,
    private movieQuery: MovieQuery,
    private deliveryQuery: DeliveryQuery,
    store: MaterialStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    const delivery = this.deliveryQuery.getActive();
    return this.movieQuery.selectActiveId().pipe(
      switchMap(movieId => {
        const query = deliveryMovieMaterialsQuery(movieId, delivery.id);
        return this.fireQuery.fromQuery<Material[]>(query).pipe(
          map(materials =>
            materials.map(material => ({
              ...material,
              step: delivery.steps.find(step => step.id === material.stepId)
            }))
          )
        );
      })
    );
  }
}
