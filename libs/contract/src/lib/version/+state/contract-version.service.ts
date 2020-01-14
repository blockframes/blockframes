import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { firestore } from 'firebase/app';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { ContractVersion, ContractWithLastVersion } from './contract-version.model';
import { ContractQuery } from '../../+state/contract.query';
import { VersionMeta } from '@blockframes/contract/+state/contract.firestore';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts/:contractId/versions' })
export class ContractVersionService extends CollectionService<ContractVersionState> {
  constructor(private contractQuery: ContractQuery, store: ContractVersionStore) {
    super(store);
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

  /**
   * Add/update a contract & create a new contract version
   * @param contract
   * @param version
   */
  public async addContractAndVersion(
    contract: ContractWithLastVersion
  ): Promise<string> {
    const contractId = (await this.add(contract.doc)) as string;
    await this.addContractVersion(contract.last);
    return contractId;
  }

  /**
   * Returns last contract version associated with contractId
   * @param contractId
   */
  public async getLastVersionContract(contractId: string): Promise<ContractVersion> {
    try {
      const _metaSnap = await this.db.doc(`contracts/${contractId}/versions/_meta`).get().toPromise();
      const { count } = _metaSnap.data() as VersionMeta;
      const lastVersion = this.getValue(count.toString());

      return lastVersion;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   *
   * @param contractVersion
   */
  public formatContractVersion(contractVersion: any): ContractVersion {
    // Dates from firebase are Timestamps, we convert it to Dates.
    if (contractVersion.scope && contractVersion.scope.start instanceof firestore.Timestamp) {
      contractVersion.scope.start = contractVersion.scope.start.toDate();
    }

    if (contractVersion.scope.end instanceof firestore.Timestamp) {
      contractVersion.scope.end = contractVersion.scope.end.toDate();
    }
    return contractVersion as ContractVersion;
  }
}
