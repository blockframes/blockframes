import { Injectable } from '@angular/core';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';
import { ContractVersion, ContractVersionWithTimeStamp, createContractVersionFromFirestore } from './contract-version.model';

export interface ContractVersionState extends EntityState<ContractVersion, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'versions' })
export class ContractVersionStore extends EntityStore<ContractVersionState> {

  constructor() {
    super();
  }

  /** Convert all firestore timestamps into dates before populating the store. */
  akitaPreAddEntity(contractVersion: ContractVersionWithTimeStamp): ContractVersion {
    return createContractVersionFromFirestore(contractVersion);
  }
}
