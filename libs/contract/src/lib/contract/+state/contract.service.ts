import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Contract, ContractDocument } from './contract.model';
import { formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";


@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {
  useMemorization=true;

  constructor(store: ContractStore) {
    super(store);
  }

  /**
   * This converts the ContractDocument into an Organization
   * @param contract
   */
  formatFromFirestore(contract: ContractDocument): Contract {
    return {
      ...contract,
      _meta: formatDocumentMetaFromFirestore(contract?._meta)
    };
  }
}
