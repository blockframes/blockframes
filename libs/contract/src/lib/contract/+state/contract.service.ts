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
  createContractTitleDetail,
} from './contract.model';

import { ContractDocumentWithDates, ContractDocument } from './contract.firestore';
import type firebase from 'firebase';
import { Observable } from 'rxjs';
import { cleanModel } from '@blockframes/utils/helpers';
import { map } from 'rxjs/internal/operators/map';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { DistributionRight, createDistributionRight } from '@blockframes/distribution-rights/+state/distribution-right.model';
import { centralOrgID } from '@env';
import { DistributionRightService } from '@blockframes/distribution-rights/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { CollectionReference } from '@angular/fire/firestore/interfaces';

export type TitlesAndRights = Record<string, DistributionRight[]>;

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(
    private permissionsService: PermissionsService,
    private distributionRightService: DistributionRightService,
    private organizationService: OrganizationService,
    store: ContractStore
  ) {
    super(store);
  }

  onCreate(contract: Contract, { write }: WriteOptions) {
    // When a contract is created, we also create a permissions document for each parties.
    return this.permissionsService.addDocumentPermissions(contract.id, write as firebase.firestore.Transaction)
  }

  /**
   * This converts the Contract into a ContractDocumentWithDates
   * to clean the unused properties in the database (lastVersion).
   * @param contract
   */
  formatToFirestore(contract: Contract): ContractDocumentWithDates {
    return cleanContract(contract);
  }

  /** 
   * This converts the ContractDocument into a Contract
   * @param contract
   * @dev If this method is implemented, remove akitaPreAddEntity and akitaPreUpdateEntity on store
   */
  formatFromFirestore(contract: ContractDocument): Contract {
    return createContractFromFirestore(contract)
  }

  /**
   * Gets the mandate contract of an organization
   * @param orgId
   */
  public async getMandate(orgId: string): Promise<Contract> {
    const query = (ref: CollectionReference) => ref.where('partyIds', 'array-contains', orgId)
      .where('type', '==', 'mandate')
      .limit(1);
    const contracts = await this.getValue(query);

    // Should only have one result
    return (contracts && contracts.length) ? createContract(contracts.pop()) : undefined;
  }

  /**
   * Gets a contract from a movieId and a distributionRightId
   * @param movieId
   * @param distributionRightId
   */
  public async getContractFromRight(movieId: string, distributionRightId: string): Promise<Contract> {
    const contracts = await this.getValue(ref =>
      ref.where(`lastVersion.titles.${movieId}.distributionRightIds`, 'array-contains', distributionRightId),
    );

    // Can have only one result
    return contracts.length ? contracts.pop() : undefined;
  }

  /**
   * Creates a new contract
   * @dev Contract differentiation between types (mandate, sale etc..) is made on the backend functions side.
   * @see apps/backend-functions/src/contract.ts
   * @param contract The contract to add
   */
  public async create(contract: Partial<Contract>): Promise<string> {
    return await this.add(createContract(contract));
  }

  /**
   * Use this method to push rights and init the related contract
   * @param licenseeId
   * @param titlesAndRights
   * @param contract
   */
  public async createContractAndRight(licenseeId: string, titlesAndRights: TitlesAndRights, contract: Contract = createContract({ type: 'sale' })): Promise<string> {
    if (!contract.id) {
      contract.id = this.db.createId();
    }

    // Licensee is the current logged in org
    const licensees = getContractParties(contract, 'licensee');
    if (licensees.length === 0) {
      const licensee = createContractPartyDetail();
      licensee.party.orgId = licenseeId;
      licensee.party.role = 'licensee';
      contract.parties.push(licensee);
    }

    // Licensor will always be centralOrgID
    const licensors = getContractParties(contract, 'licensor');
    if (licensors.length === 0) {
      const licensor = createContractPartyDetail();
      licensor.party.orgId = centralOrgID
      licensor.party.role = 'licensor';
      contract.parties.push(licensor);
    }

    // Add contract
    const isValid = await this.validateAndConsolidateContract(contract);
    if (isValid) {
      const write = this.db.firestore.batch();
      for (const titleId of Object.keys(titlesAndRights)) {
        const rights = titlesAndRights[titleId];
        const rightDocs = rights.map(d => createDistributionRight({ ...d, contractId: contract.id }));
        const distributionRightIds = await this.distributionRightService.add(rightDocs, { params: { movieId: titleId }, write });
        contract.lastVersion.titles[titleId] = createContractTitleDetail({ distributionRightIds, titleId: titleId });
      }

      const contractId = await this.add(contract, { write });
      // Save batch
      await write.commit();
      return contractId;
    }

  }

  /**
   * Various validation steps for validating a contract
   * Also add data to contract such as parties display names
   * @param contract
   */
  public async validateAndConsolidateContract(contract: Contract): Promise<boolean> {

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

    // Fetch displayName for parties that have orgId defined
    for (const p of contract.parties) {
      if (p.party.orgId) {
        const org = await this.organizationService.getValue(p.party.orgId);
        p.party.displayName = org.denomination.full;
      }
    }

    // Other contract validation steps goes here
    // TODO: Add more validations steps to the validateAndConsolidateContract function => ISSUE#1542

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
    return this.collection.doc<Contract>(contractId).valueChanges().pipe(
      map((contract: Contract) => createContractFromFirestore(contract))
    );
  }

  public listenOnPublicContract(contractId: string): Observable<PublicContract> {
    return this.db.collection('publicContracts').doc<PublicContract>(contractId).valueChanges();
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

  /**
   * Changes contract status to submitted. Also updates distribution rights state.
   * @param _contract
   */
  public async submit(_contract: Contract) {
    const write = this.db.firestore.batch();
    const contract = { ..._contract };
    contract.lastVersion = { ...contract.lastVersion, status: 'submitted' }; // For read-only purposes
    this.update(contract, { write });

    for (const titleId in contract.lastVersion.titles) {
      this.distributionRightService.update(
        contract.lastVersion.titles[titleId].distributionRightIds,
        { status: 'undernegotiation' },
        { params: { movieId: titleId }, write }
      );
    };
    return write.commit();
  }

}
