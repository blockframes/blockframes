
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { MaterialStore, Material } from '../+state';
import { switchMap } from 'rxjs/operators';
import { DeliveryQuery, Delivery } from '../../delivery/+state';

const deliveryMaterialsQuery = (delivery: Delivery): Query<Material[]> => ({
  path: `movies/${delivery.movieId}/materials`,
  queryFn: ref => ref.where('deliveryIds', 'array-contains', delivery.id )
});

@Injectable({ providedIn: 'root' })
export class DeliveryMaterialsGuard extends StateListGuard<Material> {
  urlFallback = 'layout';

  constructor(
    private fireQuery: FireQuery,
    private deliveryQuery: DeliveryQuery,
    store: MaterialStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    return this.deliveryQuery.selectActive().pipe(
      switchMap(delivery => {
        const query = deliveryMaterialsQuery(delivery);
        return this.fireQuery.fromQuery<Material[]>(query)
      })
    );
  }
}
