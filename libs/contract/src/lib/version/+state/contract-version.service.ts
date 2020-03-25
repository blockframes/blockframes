import { Injectable } from '@angular/core';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { VersionMeta, ContractVersion, createContractVersionFromFirestore, cleanContractVersion } from './contract-version.model';
import { ContractQuery } from '../../contract/+state/contract.query';
import { ContractVersionDocumentWithDates } from '@blockframes/contract/contract/+state/contract.firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/versions' })
export class ContractVersionService extends CollectionService<ContractVersionState> {
  constructor(
    private contractQuery: ContractQuery,
    store: ContractVersionStore
  ) {
    super(store);
  }

  onDelete() {
    this.db.firestore.runTransaction(async tx => {
      // Get the _meta document from versions subcollection.
      const _metaSnap = await tx.get(this.db.doc(`contracts/${this.contractQuery.getActiveId()}/versions/_meta`).ref);
      const _meta = _metaSnap.data() as VersionMeta;

      // Decrement count
      --_meta.count;

      tx.update(_metaSnap.ref, _meta);
    });
  }

  /**
   * This convert the ContractVersion into a ContractVersionDocumentWithDates
   * to clean the unwanted properties in the database.
  */
  formatToFirestore(contract: ContractVersion): ContractVersionDocumentWithDates {
    return cleanContractVersion(contract);
  }

  /**
   * Returns last contract version.
   * @param contractId
   */
  public async getContractLastVersion(contractId: string): Promise<ContractVersion> {
    const { count } = await this.getValue('_meta', { params: { contractId } }) as VersionMeta;
    if (!!count) {
      const lastVersion = await this.getValue(count.toString(), { params: { contractId } });
      return createContractVersionFromFirestore(lastVersion);
    }
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
