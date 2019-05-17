import { Injectable } from '@angular/core';
import { StateActiveGuard, FireQuery, Query } from '@blockframes/utils';
import { Delivery, DeliveryStore } from '../+state';
import { Router } from '@angular/router';

export const deliveryActiveQuery = (deliveryId: string): Query<Delivery> => ({
  path: `deliveries/${deliveryId}`
});

@Injectable({ providedIn: 'root' })
export class DeliveryActiveGuard extends StateActiveGuard<Delivery> {
  readonly params = ['deliveryId'];
  readonly urlFallback: 'layout';

  constructor(private fireQuery: FireQuery, store: DeliveryStore, router: Router) {
    super(store, router);
  }

  query({ deliveryId }) {
    const query = deliveryActiveQuery(deliveryId);
    return this.fireQuery.fromQuery<Delivery>(query);
  }
}
