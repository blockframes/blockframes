import { createPrice } from '@blockframes/utils/common-interfaces/price';
import {
  ContractDocumentWithDates,
  ContractTitleDetail,
  ContractPartyDetailDocumentWithDates,
  ContractPartyDetailDocumentWithDatesDocument,
  LegalDocument,
  ContractLegalDocuments,
  ContractDocument,
  PublicContractDocumentWithDates
} from './contract.firestore';
import { createParty } from '@blockframes/utils/common-interfaces/identity';
import {
  ContractVersion,
  ContractVersionWithTimeStamp,
  createContractVersionFromFirestore,
  cleanContractVersion,
  createContractVersion
} from '../../version/+state/contract-version.model';
import { LegalRoles } from '@blockframes/utils/static-model/types';
import { getKeyIfExists, toDate } from '@blockframes/utils/helpers';

export interface Contract extends ContractDocumentWithDates {
  versions?: ContractVersion[];
};

export type PublicContract = PublicContractDocumentWithDates;

export interface ContractWithTimeStamp extends ContractDocument {
  versions?: ContractVersionWithTimeStamp[];
};

export type ContractPartyDetail = ContractPartyDetailDocumentWithDates;

export type ContractPartyDetailDocument = ContractPartyDetailDocumentWithDatesDocument;

export function createContract(params: Partial<Contract> = {}): Contract {
  return {
    id: params.id || '',
    type: 'mandate',
    parties: [],
    titleIds: [],
    partyIds: [],
    ...params,
    documents: createContractLegalDocuments(params.documents),
    lastVersion: createContractVersion(params.lastVersion)
  };
}

export function createPublicContract(params: Partial<PublicContract> = {}): PublicContract {
  return {
    id: params.id || '',
    type: 'mandate',
    titleIds: [],
    ...params,
  };
}

export function createContractTitleDetail(
  params: Partial<ContractTitleDetail> = {}
): ContractTitleDetail {
  return {
    titleId: '',
    distributionRightIds: [],
    ...params,
    price: createPrice(params.price)
  };
}

export function createContractPartyDetail(
  params: Partial<ContractPartyDetail> = {}
): ContractPartyDetail {
  return {
    status: 'unknown',
    childRoles: [],
    ...params,
    party: createParty(params.party),
  };
}

/**
 * Various validation steps for validating a contract
 * Currently (dec 2019), only validate that there is a licensee and a licensor
 * @param contract
 */
export function validateContract(contract: Contract): boolean {
  // First, contract must have at least a licensee and a licensor

  if (contract.parties.length < 2) {
    return false;
  }
  const licensees = contract.parties.filter(
    p => p.party.role === getKeyIfExists('legalRoles', 'licensee')
  );
  const licensors = contract.parties.filter(
    p => p.party.role === getKeyIfExists('legalRoles', 'licensor')
  );

  if (!licensees.length || !licensors.length) {
    return false;
  }

  for (const licensee of licensees) {
    if (licensee.party.orgId === undefined) {
      delete licensee.party.orgId;
    }
    if (typeof licensee.party.showName !== 'boolean') {
      return false;
    }
  }

  for (const licensor of licensors) {
    if (licensor.party.orgId === undefined) {
      delete licensor.party.orgId;
    }
    if (typeof licensor.party.showName !== 'boolean') {
      return false;
    }
  }

  // Other contract validation steps goes here
  // ...

  return true;
}

export function buildChainOfTitle() {
  // ie:  calculate contract prices and fees for each parents
  // @todo #1657 implement this
}


/** Cleans an organization of its optional parameters */
export function cleanContract(contract: Contract) {
  const c = { ...contract };
  delete c.versions; // Remove akita values
  if (!c.signDate) {
    delete c.signDate;
  }
  if (!!c.lastVersion) {
    c.lastVersion = cleanContractVersion(c.lastVersion);
  }
  return c;
}

export function createContractLegalDocuments(
  params: Partial<ContractLegalDocuments> = {}
): ContractLegalDocuments {
  return {
    invoices: [],
    expenses: [],
    ...params
  }
}

export function createLegalDocument(
  params: Partial<LegalDocument> = {}
): LegalDocument {
  return {
    id: '',
    label: '',
    ...params,
    media: params.media ?? '',
  }
}

export function createContractFromFirestore(contract: any): Contract {
  const c = {
    ...contract,
    signDate: toDate(contract.signDate),
    parties: contract.parties
      ? contract.parties.map(partyDetails => formatPartyDetails(partyDetails))
      : []
  }

  if (contract.lastVersion) {
    c.lastVersion = createContractVersionFromFirestore(contract.lastVersion);
  }

  if (contract.versions) {
    contract.versions = contract.versions.map(version => createContractVersionFromFirestore(version))
  }

  return c;
}


///////////
// UTILS //
///////////


/**
 *
 * @param partyDetails
 */
export function formatPartyDetails(partyDetails: any): ContractPartyDetail {
  if (partyDetails.signDate) {
    partyDetails.signDate = toDate(partyDetails.signDate);
  } else {
    delete partyDetails.signDate;
  }

  return partyDetails as ContractPartyDetail;
}

/**
 * Fetch parties related to a contract given a specific legal role
 * @param contract
 * @param legalRole
 */
export function getContractParties(contract: Contract, legalRole: LegalRoles): ContractPartyDetail[] {
  const roleCode = getKeyIfExists('legalRoles', legalRole)
  return contract.parties.filter(p => p.party.role === roleCode);
}

/**
 * Fetch parties related to a contract with childRoles
 * @param contract
 */
export function getContractSubLicensors(contract: Contract): ContractPartyDetail[] {
  return contract.parties.filter(p => p.childRoles.length > 0);
}

/**
 * Takes an organization id and a contract to check
 * if the organization is party of this contract.
 * Returns true if so.
 */
export function isPartyOfContract(organizationId: string, contract: Contract): boolean {
  return contract.parties.some(partyDetails => partyDetails.party.orgId === organizationId)
}

/**
 * Takes an organization id and a contract to check
 * if the organization is signatory on this contract.
 * @param orgnizationId
 * @param contract
 */
export function isContractSignatory(contract: Contract, organizationId: string): boolean {
  return contract.parties.some(partyDetails => {
    const { orgId, role } = partyDetails.party;
    return orgId === organizationId && role === 'signatory';
  })
}

/**
 * Returns only the validated contracts.
 * @param contracts
 */
export function getValidatedContracts(contracts: Contract[]): Contract[] {
  const validStatus = 'paid' || 'waitingpayment' || 'accepted';
  return contracts.filter(contract => contract.lastVersion.status === validStatus)
}
