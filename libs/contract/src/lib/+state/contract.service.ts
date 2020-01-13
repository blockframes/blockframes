import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { getCodeIfExists } from '@blockframes/movie/moviestatic-model/staticModels';
import { CollectionConfig, CollectionService, awaitSyncQuery, Query } from 'akita-ng-fire';
import { Contract, ContractPartyDetail } from './contract.model';
import orderBy from 'lodash/orderBy';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { tap, switchMap } from 'rxjs/operators';
import { ContractVersionService } from '../version/+state/contract-version.service';
import { initContractWithVersion, ContractWithLastVersion } from '../version/+state/contract-version.model';
import { LegalRolesSlug } from '@blockframes/movie/moviestatic-model/types';
import { cleanModel } from '@blockframes/utils';

const contractsListQuery = (orgId: string): Query<Contract[]> => ({
  path: 'contracts',
  queryFn: ref => ref.where('partyIds', 'array-contains', orgId)
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(private organizationQuery: OrganizationQuery, private contractVersionService: ContractVersionService, store: ContractStore) {
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
   * @dev Fetch contract and last version
   */
  public async getContractWithLastVersion(contractId: string): Promise<ContractWithLastVersion> {
    try {
      const contractWithVersion = initContractWithVersion();
      contractWithVersion.doc = this.formatContract(await this.getValue(contractId));
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
    const contracts = await this.getValue(ref => ref.where('titleIds', 'array-contains', movieId));

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
  public isContractValid(contract: Contract): boolean {

    // First, contract must have at least a licensee and a licensor

    if (contract.parties.length < 2) {
      return false;
    }

    const licensees = this.getContractParties(contract, 'licensee');
    const licensors = this.getContractParties(contract, 'licensor');

    if (!licensees.length || !licensors.length) {
      return false;
    }

    for (const licensee of licensees) {
      // Cleaning model to remove undefined properties.
      cleanModel(licensee);

      // If showName is not set, the contract is invalid, function returns false.
      if (typeof licensee.party.showName !== 'boolean') {
        return false;
      }
    }

    for (const licensor of licensors) {
      // Cleaning model to remove undefined properties.
      cleanModel(licensor);

      // If showName is not set, the contract is invalid, function returns false.
      if (typeof licensor.party.showName !== 'boolean') {
        return false;
      }
    }

    // Other contract validation steps goes here
    // TODO: Add more validations steps to the isContractValid function => ISSUE#1542

    return true;
  }

  /**
   * Fetch parties related to a contract given a specific legal role
   * @param contract
   * @param legalRole
   */
  public getContractParties(contract: Contract, legalRole: LegalRolesSlug): ContractPartyDetail[] {
    return contract.parties.filter(p => p.party.role === getCodeIfExists('LEGAL_ROLES', legalRole));
  }
}
