import { Injectable } from '@angular/core';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { ContractVersion, createContractVersionFromFirestore } from './contract-version.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/versions' })
export class ContractVersionService extends CollectionService<ContractVersionState> {

  /**
   * @dev This class is to fetch historized versions of contract only.
   * Rules should prevent to write on this subcollection.
   * @param store 
   */
  constructor(
    store: ContractVersionStore
  ) {
    super(store);
  }

  /**
   * @dev This collection is read only
   * @see apps/backend-functions/src/contract.ts
   * @param _  ContractVersion
   */
  formatToFirestore(_) { return undefined; }

  /**
   * Listen on all versions of a given contract
   * @param contractId 
   */
  public listenOnContractVersions(contractId: string): Observable<ContractVersion[]> {
    return this.db.collection(`contracts/${contractId}/versions`)
      .valueChanges()
      .pipe(
        map((versions: ContractVersion[]) => versions.map(v => createContractVersionFromFirestore(v)))
      );
  }
}
