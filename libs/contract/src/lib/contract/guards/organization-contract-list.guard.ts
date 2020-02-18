import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { ContractService, ContractState } from '../+state';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class OrganizationContractListGuard extends CollectionGuard<ContractState> {
  constructor(protected service: ContractService) {
    super(service);
  }

  /**
   * Sync on the active organization contracts.
   */
  sync() {
    return this.service.syncOrganizationContracts();
  }
}
