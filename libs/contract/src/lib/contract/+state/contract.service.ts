import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService, awaitSyncQuery, Query, WriteOptions } from 'akita-ng-fire';
import { Contract, ContractPartyDetail, convertToContractDocument, createContractPartyDetail, createPartyDetails, initContractWithVersion, ContractWithLastVersion, ContractWithTimeStamp } from './contract.model';
import orderBy from 'lodash/orderBy';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { tap, switchMap } from 'rxjs/operators';
import { ContractVersionService } from '../../version/+state/contract-version.service';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { LegalRolesSlug } from '@blockframes/utils/static-model/types';
import { cleanModel } from '@blockframes/utils';
import { PermissionsService } from '@blockframes/organization';
import { ContractDocumentWithDates, ContractStatus } from './contract.firestore';
import { VersionMeta } from '../../version/+state/contract-version.model';
import { firestore } from 'firebase/app';

/**
 * Get all the contracts where user organization is party.
 * Also check that there is no childContractIds to never fetch
 * contract between organization and Archipel Content.
 */
const contractsListQuery = (orgId: string): Query<ContractWithTimeStamp[]> => ({
  path: 'contracts',
  queryFn: ref => ref.where('partyIds', 'array-contains', orgId).where('childContractIds', '==', []),
    versions: contract => ({
      path: `contracts/${contract.id}/versions`
    })
});

/** Get the active contract and put his lastVersion in it. */
const contractQuery = (contractId: string): Query<ContractWithTimeStamp> => ({
  path: `contracts/${contractId}`,
    versions: contract => ({
      path: `contracts/${contract.id}/versions`
    })
})


export function getLastVersionIndex(contract: Contract): number {
  const { count }: VersionMeta = contract.versions.find(v => v.id === '_meta')
  return contract.versions.map(v => v.id).indexOf(count.toString())
}

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(
    private organizationQuery: OrganizationQuery,
    private contractVersionService: ContractVersionService,
    private permissionsService: PermissionsService,
    store: ContractStore
  ) {
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

  /** Sync the store with the given contract. */
  public syncContractQuery(contractId: string) {
    // Reset the store to clean the active contract.
    this.store.reset();
    return awaitSyncQuery.call(this, contractQuery(contractId));
  }

  onCreate(contract: Contract, { write }: WriteOptions) {
    // When a contract is created, we also create a permissions document for each parties.
    return this.permissionsService.addDocumentPermissions(contract, write as firestore.WriteBatch)
  }

  /**
   * This convert the Contract into a ContractDocumentWithDates
   * to clean the unused properties in the database (lastVersion).
  */
  formatToFirestore(contract: Contract): ContractDocumentWithDates {
    return convertToContractDocument(contract);
  }

  /**
   * @dev Fetch contract and last version. Using contract from store as an argument
   * is always better as it send less queries to the database
   *
   * @param contractOrId argument can be either an string or a Contract
   */
  public async getContractWithLastVersion(contractOrId: Contract | string): Promise<ContractWithLastVersion> {
    try {
      const contractWithVersion = initContractWithVersion()
      const contract = typeof contractOrId === 'string'
        ? await this.getValue(contractOrId)
        : contractOrId

      contractWithVersion.doc = this.formatContract(contract);
      const lastVersion = await this.contractVersionService.getLastVersionContract(contract.id);
      if (lastVersion) {
        contractWithVersion.last = lastVersion;
      }

      return contractWithVersion;
    } catch (error) {
      console.warn(`Contract ${typeof contractOrId === 'string' ? contractOrId : contractOrId.id} not found.`);
    }
  }

  public async getContractListWithLastVersion(contracts: Contract[]) {
    const promises: Promise<ContractWithLastVersion>[] =[];
    contracts.forEach(contract => {
      promises.push(this.getContractWithLastVersion(contract))
    })

    return Promise.all(promises)
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
          ref.where(`titles.${movieId}.distributionDealIds`, 'array-contains', distributionDealId),
          { params: { contractId: contract.id } }
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
   * Add/update a contract & create a new contract version
   * @param contract
   * @param version
   */
  public async addContractAndVersion(
    contract: ContractWithLastVersion
  ): Promise<string> {
    await this.add(contract.doc);
    await this.contractVersionService.addContractVersion(contract);
    return contract.doc.id;
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

    // Other contract validation steps goes here
    // TODO: Add more validations steps to the isContractValid function => ISSUE#1542

    return true;
  }

  /**
   * This function appends data to contracts by looking on its parents contracts
   * @param contract
   * @param parentContracts
   */
  public async populatePartiesWithParentRoles(contract: Contract, parentContracts?: Contract[]): Promise<Contract> {

    /**
     * @dev If any parent contracts of this current contract have parties with childRoles defined,
     * We take thoses parties of the parent contracts to put them as regular parties of the current contract.
     */
    if (parentContracts.length === 0) {
      const promises = contract.parentContractIds.map(id => this.getValue(id));
      parentContracts = await Promise.all(promises);
    }

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

    return contract;
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

  /**
   * Takes an organization id and a contract to check
   * if the organization is signatory on this contract.
   * @param orgnizationId
   * @param contract
   */
  public isContractSignatory(contract: Contract, orgnizationId: string): boolean {
    return contract.parties.some(
      partyDetails =>
        partyDetails.party.orgId === orgnizationId && partyDetails.party.role === 'signatory'
    );
  }

  public acceptOffer(contract: Contract, organizationId: string) {
    const index = contract.parties.findIndex(
      partyDetails =>
        partyDetails.party.orgId === organizationId && partyDetails.party.role === 'signatory'
    );
    const updatedParty = createPartyDetails({
        ...contract.parties[index],
        signDate: new Date(),
        status: ContractStatus.accepted
    });
    const updatedParties = [...contract.parties.slice(0, index), updatedParty, ...contract.parties.slice(index + 1)];
    this.update({ ...contract, parties: updatedParties })
  }

  public declineOffer(contract: Contract, organizationId: string) {
    const index = contract.parties.findIndex(
      partyDetails =>
        partyDetails.party.orgId === organizationId && partyDetails.party.role === 'signatory'
    );
    const updatedParty = createPartyDetails({
        ...contract.parties[index],
        status: ContractStatus.rejected
    });
    const updatedParties = [...contract.parties.slice(0, index), updatedParty, ...contract.parties.slice(index + 1)];
    this.update({ ...contract, parties: updatedParties })
  }
}
