import { Injectable } from '@angular/core';
import { DeliveryService, DeliveryState, DeliveryStore } from '../+state';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class DeliveryActiveGuard extends CollectionGuard<DeliveryState> {
  constructor(protected service: DeliveryService, private store: DeliveryStore) {
    super(service);
  }

  sync(next: ActivatedRouteSnapshot) {
    const deliveryId = next.params.deliveryId;
    // Custom query to load organization in stakeholders of the delivery
    return this.service.syncDeliveryQuery(deliveryId).pipe(
      // Set active the delivery
      tap(_ => this.store.setActive(deliveryId))
    );
  }
}
