import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from '../+state/material.store';
import { MaterialService } from '../+state/material.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DeliveryQuery } from '../../delivery/+state/delivery.query';
import { MaterialQuery } from '../+state/material.query';
import { MovieMaterialService } from '../+state/movie-material.service';

@Injectable({ providedIn: 'root' })
export class DeliveryMaterialsGuard extends CollectionGuard<MaterialState> {
  constructor(
    service: MaterialService,
    private store: MaterialStore,
    private materialQuery: MaterialQuery,
    private deliveryQuery: DeliveryQuery,
    private movieMaterialService: MovieMaterialService
  ) {
    super(service);
  }

  get awaitSync() {
    return this.materialQuery.getCount() === 0;
  }

  sync(next: ActivatedRouteSnapshot) {
    this.store.reset();
    const { movieId, deliveryId } = next.params;

    return this.deliveryQuery.getActive().mustBeSigned
      ? this.service.syncCollection({ params: { deliveryId }})
      : this.movieMaterialService.syncCollection(
          ref => ref.where('deliveryIds', 'array-contains', deliveryId)
        );
  }
}
