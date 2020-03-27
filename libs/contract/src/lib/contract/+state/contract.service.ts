import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import {
  Contract,
  createContractPartyDetail,
  getContractParties,
  createContractFromFirestore,
  cleanContract,
  PublicContract,
  createContract,
} from './contract.model';
import { PermissionsService, OrganizationQuery } from '@blockframes/organization';
import { ContractDocumentWithDates } from './contract.firestore';
import { firestore } from 'firebase/app';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { Observable } from 'rxjs';
import { cleanModel } from '@blockframes/utils/helpers';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(
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
   * @param contract 
   */
  formatToFirestore(contract: Contract): ContractDocumentWithDates {
    return cleanContract(contract);
  }

  /**
   * Gets the mandate contract of an organization
   * @param orgId 
   */
  public async getMandate(orgId: string) {
    const query = ref => ref.where('partyIds', 'array-contains', orgId).where('type', '==', 'mandate');
    const contracts = await this.getValue(query);

    // Should only have one result
    return (contracts && contracts.length) ? contracts.pop() : undefined;
  }

  /**
   * Gets a contract from a movieId and a distributionDealId
   * @param movieId
   * @param distributionDealId
   */
  public async getContractFromDeal(movieId: string, distributionDealId: string): Promise<Contract> {
    const contracts = await this.getValue(ref => 
      ref.where(`lastVersion.titles.${movieId}.distributionDealIds`, 'array-contains', distributionDealId),
    );
    
    // Can have only one result
    return contracts.length ? contracts.pop(): undefined;
  }

  /**
   * Creates a new contract
   * @dev Contract differentiation between types (mandate, sale etc..) is made on the backend functions side.
   * @see apps/backend-functions/src/contract.ts
   * @param contract The contract to add
   */
  public async create(contract: Partial<Contract>): Promise<string> {
    return await this.add(createContract({ ...contract,  }));
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

  public listenOnContract(contractId: string): Observable<Contract> {
    return this.collection.doc<Contract>(contractId).valueChanges();
  }

  public listenOnPublicContract(contractId: string): Observable<PublicContract> {
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
