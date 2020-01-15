import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { ContractVersion, ContractWithLastVersion, VersionMeta } from './contract-version.model';
import { ContractQuery } from '../../+state/contract.query';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/versions' })
export class ContractVersionService extends CollectionService<ContractVersionState> {
  constructor(private contractQuery: ContractQuery, store: ContractVersionStore) {
    super(store);
  }

  onDelete() {
    this.db.firestore.runTransaction(async tx =>  {
      // Get the _meta document from versions subcollection.
      const _metaSnap = await tx.get(this.db.doc(`contracts/${this.contractQuery.getActiveId()}/versions/_meta`).ref);
      const _meta = _metaSnap.data() as VersionMeta;

      // Decrement count
      --_meta.count;

      tx.update(_metaSnap.ref, _meta);
    })
  }

  get path() {
    return `contracts/${this.contractQuery.getActiveId()}/versions`;
  }

  /**
   *
   * @param contractId
   * @param contractVersion
   */
  public addContractVersion(contractVersion: ContractVersion): string {
    this.db.firestore.runTransaction(async tx =>  {
      // Get the _meta document from versions subcollection.
      const _metaSnap = await tx.get(this.db.doc(`contracts/${this.contractQuery.getActiveId()}/versions/_meta`).ref);
      const _meta = _metaSnap.data() as VersionMeta;

      // Increment count and then assign it to contractVersion id.
      contractVersion.id = (++_meta.count).toString();

      // Add the version and update _meta.
      this.add(contractVersion, { write: tx.update(_metaSnap.ref, _meta)})
    })
    return contractVersion.id;
  }

  /**
   * Add/update a contract & create a new contract version
   * @param contract
   * @param version
   */
  public async addContractAndVersion(
    contract: ContractWithLastVersion
  ): Promise<string> {
    const contractId = (await this.add(contract.doc)) as string;
    this.addContractVersion(contract.last);
    return contractId;
  }

  /**
   * Returns last contract version associated with contractId
   * @param contractId
   */
  public async getLastVersionContract(): Promise<ContractVersion> {
    const _meta = await this.getValue('_meta') as VersionMeta;
    const lastVersion = this.getValue(_meta.count.toString());

    return lastVersion;
  }
}
