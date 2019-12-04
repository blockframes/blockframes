import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from '../+state/material.store';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { MaterialQuery } from '../+state/material.query';
import { MovieMaterialService } from '../+state/movie-material.service';
import { DeliveryMaterialService } from '../+state/delivery-material.service';

@Injectable({ providedIn: 'root' })
export class DeliveryMaterialsGuard extends CollectionGuard<MaterialState> {
  constructor(
    protected deliveryMaterialService: DeliveryMaterialService,
    private store: MaterialStore,
    private materialQuery: MaterialQuery,
    private deliveryQuery: DeliveryQuery,
    private movieMaterialService: MovieMaterialService
  ) {
    super(deliveryMaterialService);
  }

  get awaitSync() {
    return this.materialQuery.getCount() === 0;
  }

  sync(next: ActivatedRouteSnapshot) {
    const deliveryId = next.params.deliveryId;
    this.store.reset();
    return this.deliveryQuery.getActive().mustBeSigned
      ? this.deliveryMaterialService.syncCollection()
      : this.movieMaterialService.syncCollection(
          ref => ref.where('deliveryIds', 'array-contains', deliveryId)
        );
  }
}
