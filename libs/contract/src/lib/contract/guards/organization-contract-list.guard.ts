import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig, awaitSyncQuery, Query } from 'akita-ng-fire';
import { ContractService, ContractState, ContractStore, ContractWithTimeStamp } from '../+state';
import { tap, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';

/**
 * Get all the contracts where user organization is party.
 * Also check that there is no childContractIds to never fetch
 * contract between organization and Archipel Content.
 */
const organizationContractsListQuery = (orgId: string): Query<ContractWithTimeStamp[]> => ({
  path: 'contracts',
  queryFn: ref => ref.where('partyIds', 'array-contains', orgId).where('type', '==', 'sale'),
  /** @dev This is used to fetch all archived versions along with contract (KFH) */
  versions: contract => ({
    path: `contracts/${contract.id}/versions`
  })
});

/** Sync all contract of the active organization */
@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: false })
export class OrganizationContractListGuard extends CollectionGuard<ContractState> {
  constructor(
    protected service: ContractService,
    private store: ContractStore,
    private organizationQuery: OrganizationQuery,
  ) {
    super(service);
  }

  /**
   * Sync on the active organization contracts.
   */
  sync() {
    return this.organizationQuery.selectActiveId().pipe(
      // Clear the store everytime the active orgId changes.
      distinctUntilChanged(),
      tap(_ => this.store.reset()),
      switchMap(orgId => awaitSyncQuery.call(this.service, organizationContractsListQuery(orgId)))
    );
  }
}
