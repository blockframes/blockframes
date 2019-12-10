import { Injectable } from '@angular/core';
import { StateActiveGuard, FireQuery, Query } from '@blockframes/utils';
import { Delivery, DeliveryStore, modifyTimestampToDate, DeliveryWithTimestamps } from '../+state';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

export const deliveryActiveQuery = (deliveryId: string): Query<DeliveryWithTimestamps> => ({
  path: `deliveries/${deliveryId}`,
  stakeholders: delivery => ({
    path: `deliveries/${delivery.id}/stakeholders`,
    organization: stakeholder => ({
      path: `orgs/${stakeholder.orgId}`
    })
  })
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
    return this.fireQuery.fromQuery<DeliveryWithTimestamps>(query).pipe(
      map(delivery => modifyTimestampToDate(delivery))
    );
  }

}
