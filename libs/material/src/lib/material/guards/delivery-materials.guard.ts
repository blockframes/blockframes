import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from '../+state/material.store';
import { MaterialService } from '../+state/material.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class DeliveryMaterialsGuard extends CollectionGuard<MaterialState> {
  constructor(
    service: MaterialService,
    protected store: MaterialStore,
    private deliveryQuery: DeliveryQuery
  ) {
    super(service);
  }

  sync(next: ActivatedRouteSnapshot) {
    return this.deliveryQuery.selectActive().pipe(
      switchMap(delivery => {
        return delivery.mustBeSigned
          ? this.service.syncCollection(`deliveries/${next.params.deliveryId}/materials`)
          : this.service.syncCollection(`movies/${next.params.movieId}/materials`, ref =>
              ref.where('deliveryIds', 'array-contains', delivery.id)
            );
      })
    );
  }
}
