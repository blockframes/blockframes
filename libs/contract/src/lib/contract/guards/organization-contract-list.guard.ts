import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig, awaitSyncQuery, Query } from 'akita-ng-fire';
import { ContractService, ContractState, ContractStore, ContractWithTimeStamp } from '../+state';
import { tap, switchMap } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization/organization/+state/organization.query';

/**
 * @todo(#1887) Don't import all versions
 * Get all the contracts where user organization is party.
 * Also check that there is no childContractIds to never fetch
 * contract between organization and Archipel Content.
 */
// todo(#1887) remove versions in query
const organizationContractsListQuery = (orgId: string): Query<ContractWithTimeStamp[]> => ({
  path: 'contracts',
  queryFn: ref => ref.where('partyIds', 'array-contains', orgId).where('type', '==', 'sale'),
  versions: contract => ({
    path: `contracts/${contract.id}/versions`
  })
});

/** Sync all contract of the active organization */
@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
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
      tap(_ => this.store.reset()),
      switchMap(orgId => awaitSyncQuery.call(this.service, organizationContractsListQuery(orgId)))
    );
  }
}
