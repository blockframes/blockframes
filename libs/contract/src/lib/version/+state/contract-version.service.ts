import { Injectable } from '@angular/core';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { VersionMeta, createVersionMeta, ContractVersion } from './contract-version.model';
import { ContractQuery } from '../../contract/+state/contract.query';
import { ContractWithLastVersion, Contract } from '../../contract/+state/contract.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/versions' })
export class ContractVersionService extends CollectionService<ContractVersionState> {
  constructor(private contractQuery: ContractQuery, store: ContractVersionStore) {
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
      const lastVersionId = contractWithLastVersion.last.id;
      // Get the _meta document from versions subcollection.
      const _metaSnap = await tx.get(this.db.doc(`contracts/${contractId}/versions/_meta`).ref);
      const _meta = createVersionMeta(_metaSnap.data());
      // Increment count and then assign it to contractVersion id.
      contractWithLastVersion.last.id = (++_meta.count).toString();
      const versionRef = this.db.doc(`contracts/${contractId}/versions/${lastVersionId}`).ref;

      // Update/create _meta and add the version.
      tx.set(_metaSnap.ref, _meta);
      tx.set(versionRef, contractWithLastVersion.last);
    });
    return contractWithLastVersion.last.id;
  }

  /**
   * Returns last contract version.
   * @param contractId
   */
  public async getLastVersionContract(contractId: string): Promise<ContractVersion> {
    const { count } = (await this.getValue('_meta', { params: { contractId } })) as VersionMeta;
    if (!!count) {
      const lastVersion = await this.getValue(count.toString(), { params: { contractId } });
      return lastVersion;
    }
  }

  /**
   * Returns the creation date of the contract.
   * @param contract
   */
  public getContractInitialCreationDate(contract: Contract): Date {
    const firstContract = contract.versions.find(version => version.id === '1');
    return firstContract.creationDate;
  }
}
