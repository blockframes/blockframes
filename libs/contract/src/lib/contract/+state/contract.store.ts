import { Injectable } from '@angular/core';
import { Contract, ContractWithTimeStamp, creatContractFromFirestore } from './contract.model';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';

export interface ContractState extends EntityState<Contract>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'contracts' })
export class ContractStore extends EntityStore<ContractState> {

  constructor() {
    super();
  }

  akitaPreAddEntity(contract: ContractWithTimeStamp): Contract {
    return creatContractFromFirestore(contract)
  }

}

