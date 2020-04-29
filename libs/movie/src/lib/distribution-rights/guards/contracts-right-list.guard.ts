import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { DistributionRightState } from '../+state/distribution-right.store';
import { DistributionRightService } from '../+state/distribution-right.service';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';
import { switchMap } from 'rxjs/operators';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { of } from 'rxjs';

/** Sync every Distribution Right of ALL the contracts in the store */
@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ContractsRightListGuard extends CollectionGuard<DistributionRightState> {
  constructor(service: DistributionRightService, private contractQuery: ContractQuery) {
    super(service);
  }

  /** Gets every distribution rights of contracts in the store. */
  // TODO #2651
  sync() {
    return this.contractQuery.selectAll().pipe(
      switchMap(contracts => {
        if (contracts.length) {
          const queryContrat = (contract: Contract) => ref => ref.where('contractId', '==', contract.id);
          const $ = contracts.map(c =>
            this.service.syncCollectionGroup('distributionRights', queryContrat(c))
          );
          return combineLatest($);
        }
        return of(true)
      })
    );
  }
}
