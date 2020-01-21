import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';
import { ContractVersionService } from '../+state/contract-version.service';
import { ContractVersionState } from '../+state/contract-version.store';
import { ContractVersionQuery } from '../+state/contract-version.query';

@Injectable({ providedIn: 'root' })
export class ActiveContractVersionsGuard extends CollectionGuard<ContractVersionState> {
  constructor(service: ContractVersionService, private query: ContractVersionQuery) {
    super(service);
  }

  get awaitSync() {
    return this.query.getCount() === 0;
  }

  sync() {
    return this.service.syncCollection();
  }
}
