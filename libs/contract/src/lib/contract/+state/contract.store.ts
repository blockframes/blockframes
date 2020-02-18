import { Injectable } from '@angular/core';
import { Contract, ContractWithTimeStamp, createContractFromFirestore } from './contract.model';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';

export interface ContractState extends EntityState<Contract>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'contracts' })
export class ContractStore extends EntityStore<ContractState> {

  constructor() {
    super();
  }

  /** Convert all firestore timestamps into dates before populating the store. */
  akitaPreAddEntity(contract: ContractWithTimeStamp): Contract {
    return createContractFromFirestore(contract)
  }

}

