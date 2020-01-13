import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import orderBy from 'lodash/orderBy';
import { firestore } from 'firebase/app';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';
import { ContractVersion } from './contract-version.model';
import { ContractQuery } from '../../+state/contract.query';
import { Contract } from '../../+state/contract.model';

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
  public async addContractVersion(contractVersion: ContractVersion): Promise<string> {
    const contractVersions = await this.getValue();
    contractVersion.id = (contractVersions.length + 1).toString();

    await this.add(contractVersion);
    return contractVersion.id;
  }

  /**
   * Add/update a contract & create a new contract version
   * @param contract
   * @param version
   */
  public async addContractAndVersion(
    contract: Contract,
    version: ContractVersion
  ): Promise<string> {
    const contractId = (await this.add(contract)) as string;
    await this.addContractVersion(version);
    return contractId;
  }

  /**
   * Returns last contract version associated with contractId
   * @param contractId
   */
  public async getLastVersionContract(contractId: string): Promise<ContractVersion> {
    const contractVersions = await this.getValue();

    if (contractVersions.length) {
      const sortedContractVersions = orderBy(contractVersions, 'creationDate', 'desc');
      return sortedContractVersions[0];
    } else {
      throw new Error(
        `Every contract should have at least one version. None found for ${contractId}`
      );
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
