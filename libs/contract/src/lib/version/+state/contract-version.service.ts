import { Injectable } from '@angular/core';
import { CollectionService } from 'akita-ng-fire';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { VersionMeta, createVersionMeta, ContractVersion } from './contract-version.model';
import { ContractQuery } from '../../contract/+state/contract.query';
import { ContractWithLastVersion } from '../../contract/+state/contract.model';

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
   * @dev when we are out the scope of a guard to set the contractId
   * @param contractId 
   * @todo #1644 remove this and find a workaround
   */
  public setContractId(contractId: string) {
    this.contractId = contractId;
  }

  /**
   * Add a new version of the contract.
   * @param contractId
   * @param contractWithLastVersion
   */
  public async addContractVersion(contractWithLastVersion: ContractWithLastVersion): Promise<string> {
    this.contractId = contractWithLastVersion.doc.id;
    await this.db.firestore.runTransaction(async tx => {
      // Get the _meta document from versions subcollection.
      const _metaSnap = await tx.get(this.db.doc(`${this.path}/_meta`).ref);
      const _meta = createVersionMeta(_metaSnap.data());
      // Increment count and then assign it to contractVersion id.
      contractWithLastVersion.last.id = (++_meta.count).toString();
      const versionRef = this.db.collection(`${this.path}`).doc(contractWithLastVersion.last.id).ref;

      // Update/create _meta and add the version.
      tx.set(_metaSnap.ref, _meta);
      tx.set(versionRef, contractWithLastVersion.last);
    });
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
