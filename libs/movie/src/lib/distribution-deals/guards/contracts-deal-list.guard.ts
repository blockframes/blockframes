import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { DistributionDealState } from '../+state/distribution-deal.store';
import { DistributionDealService } from '../+state/distribution-deal.service';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';
import { switchMap } from 'rxjs/operators';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';

/** Sync every Distribution Deal of ALL the contracts in the store */
@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ContractsDealListGuard extends CollectionGuard<DistributionDealState> {
  constructor(service: DistributionDealService, private contractQuery: ContractQuery) {
    super(service);
  }

  /** Gets every distribution deals of contracts in the store. */
  sync() {
    return this.contractQuery.selectAll().pipe(
      switchMap(contracts => {
        const queryContrat = (contract: Contract) => ref =>
          ref.where('contractId', '==', contract.id);
        const $ = contracts.map(c =>
          this.service.syncCollectionGroup('distributionDeals', queryContrat(c))
        );
        return combineLatest($);
      })
    );
  }
}
