import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig, awaitSyncQuery, Query } from 'akita-ng-fire';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ContractState, ContractStore, ContractWithTimeStamp, ContractService } from '../+state';
import { tap } from 'rxjs/operators';

/** Get the active contract and put his lastVersion in it. */
const contractQuery = (contractId: string): Query<ContractWithTimeStamp> => ({
  path: `contracts/${contractId}`,
  /** @dev This is used to fetch all archived versions along with contract (KFH) */
  versions: contract => ({
    path: `contracts/${contract.id}/versions`
  })
})

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ActiveContractGuard extends CollectionGuard<ContractState> {
  constructor(service: ContractService, private store: ContractStore) {
    super(service);
  }

  /**
   * Sync and set active.
   * Use it on a route with :contractId in it.
   */
  sync({ params }: ActivatedRouteSnapshot) {
    // Reset the store to clean the active contract.
    this.store.reset();
    return awaitSyncQuery.call(this.service, contractQuery(params.contractId)).pipe(
      tap(_ => this.store.setActive(params.contractId))
    );
  }
}
