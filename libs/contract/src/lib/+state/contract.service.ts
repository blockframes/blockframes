import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService, awaitSyncQuery, Query } from 'akita-ng-fire';
import { Contract, ContractPartyDetail, convertToContractDocument, createContractPartyDetail } from './contract.model';
import orderBy from 'lodash/orderBy';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { tap, switchMap } from 'rxjs/operators';
import { ContractVersionService } from '../version/+state/contract-version.service';
import { initContractWithVersion, ContractWithLastVersion } from '../version/+state/contract-version.model';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { LegalRolesSlug } from '@blockframes/utils/static-model/types';
import { cleanModel } from '@blockframes/utils';
import { ContractDocumentWithDates } from './contract.firestore';

/** Get all the contracts where user organization is party. */
const contractsListQuery = (orgId: string): Query<Contract[]> => ({
  path: 'contracts',
  queryFn: ref => ref.where('partyIds', 'array-contains', orgId)
});

/** Get the active contract and put his lastVersion in it. */
const contractQuery = (contractId: string, lastVersionId: string): Query<Contract> => ({
  path: `contracts/${contractId}`,
  lastVersion: (contract: Contract) => ({
    path: `contracts/${contract.id}/versions/${lastVersionId}`
  })
})

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(private organizationQuery: OrganizationQuery, private contractVersionService: ContractVersionService, store: ContractStore) {
    super(store);
  }

  /** Sync the store with every contracts of the active organization. */
  public syncOrganizationContracts() {
    return this.organizationQuery.selectActiveId().pipe(
      // Reset the store everytime the movieId changes.
      tap(_ => this.store.reset()),
      switchMap(orgId => awaitSyncQuery.call(this, contractsListQuery(orgId)))
    );
  }

  /**
   * Sync the store with the given contract.
   * Create a specific query of contract with a new field (lastVersion)
   * and set the new entity as active on the contracts store.
   */
  public async syncContractQuery(contractId: string) {
    // Get the last version id.
    const lastVersion = await this.contractVersionService.getLastVersionContract();
    // Reset the store to clean the active contract.
    this.store.reset();
    return awaitSyncQuery.call(this, contractQuery(contractId, lastVersion.id));
  }

  /**
   * This convert the Contract into a ContractDocumentWithDates
   * to clean the unused properties in the database (lastVersion).
  */
  formatToFirestore(contract: Contract): ContractDocumentWithDates {
    return convertToContractDocument(contract);
  }

  /**
   * @dev Fetch contract and last version
   */
  public async getContractWithLastVersion(contractId: string): Promise<ContractWithLastVersion> {
    try {

      const [contractWithVersion, contract] = await Promise.all([
        initContractWithVersion(),
        this.getValue(contractId)
      ])

      contractWithVersion.doc = this.formatContract(contract);
      contractWithVersion.last = await this.contractVersionService.getLastVersionContract();

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
          contractWithVersion.last = sortedContractVersions[0];
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
   *
   * This function validate and append data to contracts by looking on its parents contracts
   * @param contract
   */
  public async isContractValid(contract: Contract): Promise<boolean> {

    // First, contract must have at least a licensee and a licensor

    if (contract.parties.length < 2) {
      return false;
    }

    const licensees = this.getContractParties(contract, 'licensee');
    const licensors = this.getContractParties(contract, 'licensor');

    if (!licensees.length || !licensors.length) {
      return false;
    }

    for (let licensee of licensees) {
      // Cleaning model to remove undefined properties.
      licensee = cleanModel(licensee);

      // If showName is not set, the contract is invalid, function returns false.
      if (typeof licensee.party.showName !== 'boolean') {
        return false;
      }
    }

    for (let licensor of licensors) {
      // Cleaning model to remove undefined properties.
      licensor = cleanModel(licensor);

      // If showName is not set, the contract is invalid, function returns false.
      if (typeof licensor.party.showName !== 'boolean') {
        return false;
      }
    }


    /**
     * @dev If any parent contracts of this current contract have parties with childRoles defined,
     * We take thoses parties of the parent contracts to put them as regular parties of the current contract.
     */
    const promises = contract.parentContractIds.map(id => this.getValue(id));
    const parentContracts = await Promise.all(promises);
    parentContracts.forEach(parentContract => {
      const partiesHavingRoleForChilds = parentContract.parties.filter(p => p.childRoles && p.childRoles.length);
      partiesHavingRoleForChilds.forEach(parentPartyDetails => {
        parentPartyDetails.childRoles.forEach(childRole => {
          const partyDetails = createContractPartyDetail({ party: parentPartyDetails.party });
          partyDetails.party.role = childRole;
          contract.parties.push(partyDetails);
          if (partyDetails.party.orgId) {
            contract.partyIds.push(partyDetails.party.orgId);
          }
        });
      });
    });

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
    return contract.parties.filter(p => p.party.role === getCodeIfExists('LEGAL_ROLES', legalRole as ExtractCode<'LEGAL_ROLES'>));
  }

  /**
   * Takes an organization id and a contract to check
   * if the organization is party of this contract.
   * Returns true if so.
   */
  public isPartyOfContract(organizationId: string, contract: Contract): boolean {
    return contract.parties.some(partyDetails => partyDetails.party.orgId === organizationId)
  }
}
