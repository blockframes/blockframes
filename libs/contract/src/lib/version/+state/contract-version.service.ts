import { Injectable } from '@angular/core';
import { CollectionService } from 'akita-ng-fire';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { ContractVersion, ContractWithLastVersion, VersionMeta, createVersionMeta } from './contract-version.model';
import { ContractQuery } from '../../+state/contract.query';

@Injectable({ providedIn: 'root' })
export class ContractVersionService extends CollectionService<ContractVersionState> {
  private contractId: string;

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
    })
  }

  get path() {
    if (!this.contractId) {
      this.contractId = this.contractQuery.getActiveId();
    }
    return `contracts/${this.contractId}/versions`;
  }

  /**
   * Add a new version of the contract.
   * @param contractId
   * @param contractWithLastVersion
   */
  public addContractVersion(contractWithLastVersion: ContractWithLastVersion): string {
    this.db.firestore.runTransaction(async tx => {
      this.contractId = contractWithLastVersion.doc.id;
      // Get the _meta document from versions subcollection.
      const _metaSnap = await tx.get(this.db.doc(`${this.path}/_meta`).ref);
      let _meta = createVersionMeta(_metaSnap.data());
      // Increment count and then assign it to contractVersion id.
      contractWithLastVersion.last.id = (++_meta.count).toString();

      // Add the version and update _meta.
      if (_metaSnap.data() === undefined) {
        await this.add(contractWithLastVersion.last, { write: tx.set(_metaSnap.ref, _meta) })
      } else {
        await this.add(contractWithLastVersion.last, { write: tx.update(_metaSnap.ref, _meta) });
      }

    })
    return contractWithLastVersion.last.id;
  }

  /**
   * Returns last contract version.
   * @param contractId if not provided, get the last version of active contract.
   */
  public async getLastVersionContract(contractId?: string): Promise<ContractVersion> {

    if (contractId) {
      this.contractId = contractId;
    }
    const { count } = await this.getValue('_meta') as VersionMeta;
    if (!!count) {
      const lastVersion = await this.getValue(count.toString());
      return lastVersion;
    }
  }

  /**
   * Returns the creation date of the contract.
   * @param contractId if not provided, get the last version of active contract.
   */
  public async getContractInitialCreationDate(contractId?: string): Promise<Date> {
    const documentPath = contractId ? `contracts/${contractId}/versions/` : '';
    const firstVersion = await this.getValue(documentPath + '1');

    return firstVersion.creationDate;
  }
}
