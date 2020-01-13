import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { getCodeIfExists } from '@blockframes/movie/moviestatic-model/staticModels';
import { CollectionConfig, CollectionService, awaitSyncQuery, Query } from 'akita-ng-fire';
import { Contract, ContractVersion, ContractWithLastVersion, initContractWithVersion, ContractPartyDetail } from './contract.model';
import { AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import orderBy from 'lodash/orderBy';
import { firestore } from 'firebase/app';
import { LegalRolesSlug } from '@blockframes/movie/moviestatic-model/types';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { tap, switchMap } from 'rxjs/operators';

const contractsListQuery = (orgId: string): Query<Contract[]> => ({
  path: 'contracts',
  queryFn: ref => ref.where('partyIds', 'array-contains', orgId)
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(private organizationQuery: OrganizationQuery, store: ContractStore) {
    super(store);
  }

  /** Sync the store with every contracts of the active organization. */
  public syncOrganizationContracts() {
    return this.organizationQuery.selectActiveId().pipe(
      // Reset the store everytime the movieId changes
      tap(_ => this.store.reset()),
      switchMap(orgId => awaitSyncQuery.call(this, contractsListQuery(orgId)))
    );
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
   * @dev Fetch contract and last version
   */
  // @TODO #1389 Use native akita-ng-fire functions
  public async getContractWithLastVersion(contractId: string): Promise<ContractWithLastVersion> {
    try {
      const contractWithVersion = initContractWithVersion();
      contractWithVersion.doc = await this.getContract(contractId);
      contractWithVersion.last = await this.contractVersionService.getLastVersionContract(contractId);

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
  public async getContractWithLastVersionFromDeal(movieId: string, distributionDealId: string): Promise<ContractWithLastVersion> {
    const contracts = await this.getValue(ref => ref.where('titleIds', 'array-contains', movieId))

    if (contracts.length) {
      const contractWithVersion = initContractWithVersion();
      for (const contract of contracts) {
        const contractVersions = await this.contractVersionService.getValue(ref =>
          ref.where(`titles.${movieId}.distributionDealIds`, 'array-contains', distributionDealId)
        );
        if (contractVersions.length) {
          const sortedContractVersions = orderBy(contractVersions, 'id', 'desc');
          contractWithVersion.doc = this.formatContract(contract);
          contractWithVersion.last = this.contractVersionService.formatContractVersion(sortedContractVersions[0]);
          return contractWithVersion;
        }
      }
    }
  }

  /**
   *
   * @param contract
   */
  private formatContract(contract: any): Contract {
    return contract;
  }

  /**
 * Various validation steps for validating a contract
 * Currently (dec 2019), only validate that there is a licensee and a licensor
 * @param contract
 */
 public validateContract(contract: Contract): boolean {

  // First, contract must have at least a licensee and a licensor

  if (contract.parties.length < 2) { return false; }
  const licensees = contract.parties.filter(p => p.party.role === getCodeIfExists('LEGAL_ROLES', 'licensee'))
  const licensors = contract.parties.filter(p => p.party.role === getCodeIfExists('LEGAL_ROLES', 'licensor'))

  if (!licensees.length || !licensors.length) { return false; }

  for (const licensee of licensees) {
    if (licensee.party.orgId === undefined) {
      delete licensee.party.orgId
    }
    if (typeof licensee.party.showName !== 'boolean') {
      return false;
    }
  }

  for (const licensor of licensors) {
    if (licensor.party.orgId === undefined) {
      delete licensor.party.orgId
    }
    if (typeof licensor.party.showName !== 'boolean') {
      return false;
    }
  }

  // Other contract validation steps goes here
  // ...

  return true;
}
}
