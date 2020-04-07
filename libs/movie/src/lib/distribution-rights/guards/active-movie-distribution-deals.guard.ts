import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { DistributionRightState, DistributionRightStore } from '../+state/distribution-right.store';
import { DistributionRightService } from '../+state/distribution-right.service';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ActiveMovieDistributionRightsGuard extends CollectionGuard<DistributionRightState> {
  constructor(service: DistributionRightService, private store: DistributionRightStore) {
    super(service);
  }

  /**
   * Sync on the active movie distribution rights subcollection.
   * Must always be used after the ActiveMovieGuard has been called.
   */
  sync() {
    this.store.reset();
    return this.service.syncCollection();
  }
}
