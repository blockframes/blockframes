import { Injectable } from '@angular/core';
import { DeliveryState, DeliveryService, DeliveryQuery, DeliveryStore } from '../+state';
import { ActivatedRouteSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class DeliveryActiveGuard extends CollectionGuard<DeliveryState> {
  constructor(protected service: DeliveryService, private query: DeliveryQuery, private store: DeliveryStore) {
    super(service);
  }

  sync(next: ActivatedRouteSnapshot) {
    const deliveryId = next.params.deliveryId;
    return this.service.syncDeliveryActiveQuery(deliveryId).pipe(
      tap(_ => this.store.setActive(deliveryId))
    );
  }
}
