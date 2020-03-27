import { Injectable } from '@angular/core';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { ContractVersion, createContractVersionFromFirestore, cleanContractVersion } from './contract-version.model';
import { ContractVersionDocumentWithDates } from '@blockframes/contract/contract/+state/contract.firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/versions' })
export class ContractVersionService extends CollectionService<ContractVersionState> {
  constructor(
    store: ContractVersionStore
  ) {
    super(store);
  }

  /**
   * This convert the ContractVersion into a ContractVersionDocumentWithDates
   * to clean the unwanted properties in the database.
  */
  formatToFirestore(contract: ContractVersion): ContractVersionDocumentWithDates {
    return cleanContractVersion(contract);
  }

  /**
   * Listen on all versions of a given contract
   * @param contractId 
   */
  public listenOnContractVersions(contractId: string): Observable<ContractVersion[]> {
    return this.db.collection(`contracts/${contractId}/versions`)
      .valueChanges()
      .pipe(
        map((versions : ContractVersion[]) => versions.filter(v => v.id !== undefined ).map(v => createContractVersionFromFirestore(v)))
      );
  }
}
