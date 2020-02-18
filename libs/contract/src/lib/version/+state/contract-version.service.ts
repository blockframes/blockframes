import { Injectable } from '@angular/core';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { VersionMeta, createVersionMeta, ContractVersion, createContractVersionFromFirestore, cleanContractVersion } from './contract-version.model';
import { ContractQuery } from '../../contract/+state/contract.query';
import { ContractWithLastVersion } from '../../contract/+state/contract.model';
import { ContractVersionDocumentWithDates } from '@blockframes/contract/contract/+state/contract.firestore';

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
   * Add a new version of the contract.
   * @param contractId
   * @param contractWithLastVersion
   */
  public async addContractVersion(contractWithLastVersion: ContractWithLastVersion): Promise<string> {
    await this.db.firestore.runTransaction(async tx => {
      const contractId = contractWithLastVersion.doc.id;
      // Get the _meta document from versions subcollection.
      const _metaSnap = await tx.get(this.db.doc(`contracts/${contractId}/versions/_meta`).ref);
      const _meta = createVersionMeta(_metaSnap.data());
      // Increment count and then assign it to contractVersion id.
      contractWithLastVersion.last.id = (++_meta.count).toString();
      const versionRef = this.db.doc(`contracts/${contractId}/versions/${contractWithLastVersion.last.id}`).ref;

      // Update/create _meta and add the version.
      tx.set(_metaSnap.ref, _meta);
      tx.set(versionRef, contractWithLastVersion.last);
    });
    return contractWithLastVersion.last.id;
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
   * Returns contract versions.
   * @param contractId
   */
  public async getContractVersions(contractId: string): Promise<ContractVersion[]> {
    const contractsSnap = await this.db
      .collection(`contracts/${contractId}/versions`)
      .get()
      .toPromise();
    return contractsSnap.docs.filter(v => v.id !== '_meta').map(c => createContractVersionFromFirestore(c.data()));
  }
}
