import { Injectable } from '@angular/core';
import { ContractVersion } from './contract-version.model';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';
import { firestore } from 'firebase-admin';

export interface ContractVersionState extends EntityState<ContractVersion, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'versions' })
export class ContractVersionStore extends EntityStore<ContractVersionState> {

  constructor() {
    super();
  }

  akitaPreAddEntity(contractVersion: ContractVersion) {
    if (contractVersion.scope && contractVersion.scope.start instanceof firestore.Timestamp) {
      contractVersion.scope.start = contractVersion.scope.start.toDate();
    }

    if (contractVersion.scope.end instanceof firestore.Timestamp) {
      contractVersion.scope.end = contractVersion.scope.end.toDate();
    }
    return contractVersion as ContractVersion;
  }

}
