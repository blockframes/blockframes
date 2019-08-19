import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { MaterialStore, Material } from '../+state';
import { switchMap } from 'rxjs/operators';
import { DeliveryQuery } from '../../delivery/+state';

const deliveryMaterialsQuery = (deliveryId: string): Query<Material[]> => ({
  path: `deliveries/${deliveryId}/materials`
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
        const query = deliveryMaterialsQuery(delivery.id);
        return this.fireQuery.fromQuery<Material[]>(query)
      })
    );
  }
}
