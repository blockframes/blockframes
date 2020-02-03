import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { ContractService, ContractState, ContractQuery } from '../+state';

@Injectable({ providedIn: 'root' })
export class MovieContractListGuard extends CollectionGuard<ContractState> {
  constructor(protected service: ContractService, private query: ContractQuery) {
    super(service);
  }

  get awaitSync() {
    return this.query.getCount() === 0;
  }
  /**
   * Sync on the active movie contracts.
   */
  sync() {
    return this.service.syncMovieContracts();
  }
}
