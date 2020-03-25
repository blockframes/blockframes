import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import {
  Contract,
  createContractPartyDetail,
  initContractWithVersion,
  ContractWithLastVersion,
  getContractParties,
  createContractFromFirestore,
  cleanContract,
  PublicContract,
  createContract,
  createContractVersion,
  createVersionMandate
} from './contract.model';
import orderBy from 'lodash/orderBy';
import { ContractVersionService } from '../../version/+state/contract-version.service';
import { cleanModel } from '@blockframes/utils';
import { PermissionsService, OrganizationQuery } from '@blockframes/organization';
import { ContractDocumentWithDates } from './contract.firestore';
import { firestore } from 'firebase/app';
import { createContractVersionFromFirestore } from '@blockframes/contract/version/+state/contract-version.model';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(
    private contractVersionService: ContractVersionService,
    private permissionsService: PermissionsService,
    private orgQuery: OrganizationQuery,
    store: ContractStore
  ) {
    super(store);
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
    return cleanContract(contract);
  }

  /** Get the mandate contract of an organization */
  public async getMandate(orgId: string) {
    const query = ref => ref.where('partyIds', 'array-contains', orgId).where('type', '==', 'sale');
    const mandates = await this.getValue(query);
    return (mandates && mandates.length) ? mandates[0] : undefined;
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

      contractWithVersion.doc = createContractFromFirestore(contract);
      const lastVersion = await this.contractVersionService.getContractLastVersion(contract.id);
      if (lastVersion) {
        contractWithVersion.last = lastVersion; // @TODO (#1887) remove this
      }

      return contractWithVersion;
    } catch (error) {
      console.warn(`Contract ${typeof contractOrId === 'string' ? contractOrId : contractOrId.id} not found.`);
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
          ref.where(`titles.${movieId}.distributionDealIds`, 'array-contains', distributionDealId),
          { params: { contractId: contract.id } }
        );
        if (contractVersions.length) {
          const sortedContractVersions = orderBy(contractVersions, 'id', 'desc');
          contractWithVersion.doc = createContractFromFirestore(contract);
          contractWithVersion.last = createContractVersionFromFirestore(sortedContractVersions[0]);
          return contractWithVersion;
        }
      }
    }
  }

  /**
   * Create a new contract and a new version
   * @note We need this method because `addContractAndVersion` only work on the import.
   * @param contract The contract to add
   * @param version Optional content for the first version
   * @todo(#1887) Don't create _meta
   * @todo(#2041) Use distribution deal service
   */
  public async create(contract: Partial<Contract>, version: Partial<ContractVersion> = {}) {
    const write = this.db.firestore.batch();
    const org = this.orgQuery.getActive();
    // Initialize all values
    const _contract = createContract({ ...contract, partyIds: [org.id] });
    const _version = contract.type === 'mandate'
      ? createVersionMandate({ id: '1', ...version })
      : createContractVersion({ id: '1', ...version });
    // Create contract + verions + _meta version
    const contractId = await this.add(_contract, { write });
    this.contractVersionService.add(_version, { params: { contractId }, write });
    this.contractVersionService.add({ id: '_meta', count: 1 }, { params: { contractId }, write });
    await write.commit();
    return contractId;
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
   * Various validation steps for validating a contract
   * Currently (dec 2019), only validate that there is a licensee and a licensor
   * @param contract
   */
  public async isContractValid(contract: Contract): Promise<boolean> {

    // First, contract must have at least a licensee and a licensor

    if (contract.parties.length < 2) {
      return false;
    }

    const licensees = getContractParties(contract, 'licensee');
    const licensors = getContractParties(contract, 'licensor');

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
   * Accept an offer from a contract and sign it with a timestamp and a status set to accepted.
   * @param contract the active contract
   * @param organizationId the logged in user's organization
   */
  public acceptOffer(contract: Contract, organizationId: string) {
    // Get the index of logged in user party.
    const index = contract.parties.findIndex(partyDetails => {
      const { orgId, role } = partyDetails.party;
      return orgId === organizationId && role === 'signatory';
    });

    // Create an updated party with new status and a timestamp.
    const updatedParty = createContractPartyDetail({
      ...contract.parties[index],
      signDate: new Date(),
      status: 'accepted'
    });

    // Replace the party at the index and update all the parties array.
    const updatedParties = contract.parties.filter((_, i) => i !== index);
    this.update({ ...contract, parties: [...updatedParties, updatedParty] })
  }

  /**
   * Decline an offer from a contract, and sign it with a timestamp and a status set to rejected.
   * @param contract the active contract
   * @param organizationId the logged in user's organization
   */
  public declineOffer(contract: Contract, organizationId: string) {
    // Get the index of logged in user party.
    const index = contract.parties.findIndex(partyDetails => {
      const { orgId, role } = partyDetails.party;
      return orgId === organizationId && role === 'signatory';
    });

    // Create an updated party with new status and a timestamp.
    const updatedParty = createContractPartyDetail({
      ...contract.parties[index],
      signDate: new Date(),
      status: 'rejected'
    });

    // Replace the party at the index and update all the parties array.
    const updatedParties = contract.parties.filter((_, i) => i !== index);
    this.update({ ...contract, parties: [...updatedParties, updatedParty] })
  }

  public listenOnPublicContract(contractId: string) : Observable<PublicContract>{
    return this.db.collection('publicContracts').doc<PublicContract>(contractId).valueChanges();
  }

  /**
   * @dev ADMIN method
   * Get all contracts.
   */
  public async getAllContracts(): Promise<Contract[]> {
    const contractsSnap = await this.db
      .collection('contracts')
      .get()
      .toPromise();
    return contractsSnap.docs.map(c => createContractFromFirestore(c.data()));
  }

  /**
   * Get all contracts for a given movie.
   */
  public async getMovieContracts(movieId: string): Promise<Contract[]> {
    const contractsSnap = await this.db
      .collection('contracts', ref => ref.where('titleIds', 'array-contains', movieId))
      .get()
      .toPromise();
    return contractsSnap.docs.map(c => createContractFromFirestore(c.data()));
  }

}
