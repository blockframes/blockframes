import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { MaterialState, MaterialStore } from '../+state/material.store';
import { MaterialService } from '../+state/material.service';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieMaterialsGuard extends CollectionGuard<MaterialState> {
  constructor(service: MaterialService, private store: MaterialStore) {
    super(service);
  }

  sync(next: ActivatedRouteSnapshot) {
    this.store.reset();
    return this.service.syncCollection(`movies/${next.params.movieId}/materials`);
  }
}
