import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { DistributionDealState } from '../+state/distribution-deal.store';
import { DistributionDealService } from '../+state/distribution-deal.service';

/** Sync every Distribution Deal of ALL the contracts in the store */
@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ContractsDealListGuard extends CollectionGuard<DistributionDealState> {
  constructor(protected service: DistributionDealService) {
    super(service);
  }

  sync() {
    return this.service.syncContractsDeals();
  }
}
