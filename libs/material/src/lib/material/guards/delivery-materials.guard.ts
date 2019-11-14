import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from '../+state/material.store';
import { MaterialService } from '../+state/material.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { MaterialQuery } from '../+state/material.query';

@Injectable({ providedIn: 'root' })
export class DeliveryMaterialsGuard extends CollectionGuard<MaterialState> {
  constructor(
    service: MaterialService,
    private store: MaterialStore,
    private materialQuery: MaterialQuery,
    private deliveryQuery: DeliveryQuery
  ) {
    super(service);
  }

  get awaitSync() {
    return this.materialQuery.getCount() === 0;
  }

  sync(next: ActivatedRouteSnapshot) {
    this.store.reset();
    return this.deliveryQuery.getActive().mustBeSigned
      ? this.service.syncCollection(`deliveries/${next.params.deliveryId}/materials`)
      : this.service.syncCollection(`movies/${next.params.movieId}/materials`, ref =>
          ref.where('deliveryIds', 'array-contains', next.params.deliveryId)
          );
  }
}
