import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { DistributionDealState } from '../+state/distribution-deal.store';
import { DistributionDealService } from '../+state/distribution-deal.service';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';
import { switchMap } from 'rxjs/operators';

/** Sync every Distribution Deal of ALL the contracts in the store */
@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ContractsDealListGuard extends CollectionGuard<DistributionDealState> {
  constructor(
    protected service: DistributionDealService,
    private contractQuery: ContractQuery,
  ) {
    super(service);
  }

  sync() {
    return this.contractQuery.selectAll().pipe(
      switchMap(contracts => this.service.syncContractsDeals(contracts))
    )
  }
}
