import { Injectable } from '@angular/core';
import { StateActiveGuard, FireQuery, Query } from '@blockframes/utils';
import { Delivery, DeliveryStore, modifyTimestampToDate, DeliveryDB } from '../+state';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Stakeholder } from '@blockframes/movie';
import { Organization } from '@blockframes/organization';

export const deliveryActiveQuery = (deliveryId: string): Query<DeliveryDB> => ({
  path: `deliveries/${deliveryId}`,
  stakeholders: (delivery: DeliveryDB): Query<Stakeholder> => ({
    path: `deliveries/${delivery.id}/stakeholders`,
    organization: (stakeholder: Stakeholder): Query<Organization> => ({
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
    return this.fireQuery
      .fromQuery<DeliveryDB>(query)
      .pipe(map(delivery => modifyTimestampToDate(delivery)));
  }
}
