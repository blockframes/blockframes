import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Contract, ContractVersion, ContractWithLastVersion, createContractWithVersion } from './contract.model';
import { AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import orderBy from 'lodash/orderBy';
import { firestore } from 'firebase/app';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(store: ContractStore) {
    super(store);
  }

  /**
   * @param contract
   */ 
  // @TODO #1389 Use native akita-ng-fire functions
  public async addContract(contract: Contract): Promise<string> {
    if (!contract.id) {
      contract.id = this.db.createId();
    }

    await this.db.collection('contracts').doc(contract.id).set(contract);
    return contract.id;
  }

  /**
   * 
   * @param contractId 
   * @param contractVersion 
   */
  // @TODO #1389 Use native akita-ng-fire functions
  public async addContractVersion(contractId: string, contractVersion: ContractVersion): Promise<string> {
    const snapshot = await this.contractsVersionCollection(contractId).get().toPromise();
    contractVersion.id = (snapshot.size + 1).toString();

    await this.contractsVersionCollection(contractId).doc(contractVersion.id).set(contractVersion);
    return contractVersion.id;
  }

  /**
   * Add/update a contract & create a new contract version
   * @param contract 
   * @param version 
   */
  // @TODO #1389 Use native akita-ng-fire functions
  public async addContractAndVersion(contract: Contract, version: ContractVersion): Promise<string> {
    const contractId = await this.addContract(contract);
    await this.addContractVersion(contractId, version);
    return contractId;
  }

  /**
   * 
   * @param contractId 
   */
  // @TODO #1389 Use native akita-ng-fire functions
  public async getContract(contractId: string): Promise<Contract> {
    const snapshot = await this.db.collection('contracts').doc(contractId).get().toPromise();
    const doc = snapshot.data();
    return !!doc ? this.formatContract(doc) : undefined;
  }

  /**
   *
   * @param contractId
   */
  // @TODO #1389 Use native akita-ng-fire functions
  public contractsVersionCollection(contractId: string): AngularFirestoreCollection<ContractVersion> {
    return this.contractDoc(contractId).collection('versions');
  }

  /**
   * 
   * @param contractId 
   */
  private contractDoc(contractId: string): AngularFirestoreDocument<Contract> {
    return this.db.doc(`contracts/${contractId}`);
  }

  /**
   * Returns last contract version associated with contractId
   * @param contractId 
   */
  // @TODO #1389 Use native akita-ng-fire functions
  public async getLastVersionContract(contractId: string): Promise<ContractVersion> {
    const snapshot = await this.contractsVersionCollection(contractId).ref
      .orderBy('creationDate', 'desc')
      .limit(1)
      .get()

    if (snapshot.size) {
      return this.formatContractVersion(snapshot.docs[0].data());
    } else {
      throw new Error(`Every contract should have at least one version. None found for ${contractId}`);
    }
  }

  /**
   * @dev Fetch contract and last version
   */
  // @TODO #1389 Use native akita-ng-fire functions
  public async getContractWithLastVersion(contractId: string): Promise<ContractWithLastVersion> {
    try {
      const contractWithVersion = createContractWithVersion();
      contractWithVersion.doc = await this.getContract(contractId);
      contractWithVersion.last = await this.getLastVersionContract(contractId);

      return contractWithVersion;
    } catch (error) {
      console.log(`Contract ${contractId} not found`);
    }
  }

  /**
   * 
   * @param movieId 
   * @param distributionDealId 
   */
  // @TODO #1389 Use native akita-ng-fire functions
  public async getContractWithLastVersionFromDeal(movieId: string, distributionDealId: string): Promise<ContractWithLastVersion> {
    const contractSnapShot = await this.db
      .collection('contracts', ref => ref.where('titleIds', 'array-contains', movieId))
      .get().toPromise();

    if (contractSnapShot.docs.length) {
      const contractWithVersion = createContractWithVersion();
      for (const contract of contractSnapShot.docs) {

        const versionSnapshot = await this.contractsVersionCollection(contract.id).ref
          .where(`titles.${movieId}.distributionDealIds`, 'array-contains', distributionDealId)
          .get();

        if (versionSnapshot.size) {
          const docs = versionSnapshot.docs.map(d => d.data());
          const sortedDocs = orderBy(docs, 'id', 'desc');
          contractWithVersion.doc = this.formatContract(contract.data());
          contractWithVersion.last = this.formatContractVersion(sortedDocs[0]);
          return contractWithVersion;
        }
      }

    }
  }

  /**
   * 
   * @param contractVersion 
   */
  private formatContractVersion(contractVersion: any): ContractVersion {
    // Dates from firebase are Timestamps, we convert it to Dates.
    if (contractVersion.scope && contractVersion.scope.start instanceof firestore.Timestamp) {
      contractVersion.scope.start = contractVersion.scope.start.toDate();
    }

    if (contractVersion.scope.end instanceof firestore.Timestamp) {
      contractVersion.scope.end = contractVersion.scope.end.toDate();
    }
    return contractVersion as ContractVersion;
  }

  /**
   * 
   * @param contract 
   */
  private formatContract(contract: any): Contract {
    return contract;
  }
}
