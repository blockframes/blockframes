import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { DistributionDealState, DistributionDealStore } from '../+state/distribution-deal.store';
import { DistributionDealService } from '../+state/distribution-deal.service';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ActiveMovieDistributionDealsGuard extends CollectionGuard<DistributionDealState> {
  constructor(service: DistributionDealService, private store: DistributionDealStore) {
    super(service);
  }

  /**
   * Sync on the active movie distribution deals subcollection.
   * Must always be used after the ActiveMovieGuard has been called.
   */
  sync() {
    this.store.reset();
    return this.service.syncCollection();
  }
}
