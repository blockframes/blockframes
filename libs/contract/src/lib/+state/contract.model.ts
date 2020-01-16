import { createTerms } from '@blockframes/utils/common-interfaces/terms';
import { getCodeIfExists, ExtractCode } from '@blockframes/movie/movie/static-model/staticModels';
import { LegalRolesSlug } from '@blockframes/movie/movie/static-model/types';
import { createPrice } from '@blockframes/utils/common-interfaces/price';
import {
  ContractDocumentWithDates,
  ContractStatus,
  ContractTitleDetail,
  ContractPartyDetailDocumentWithDates,
  ContractPartyDetailDocumentWithDatesDocument
} from './contract.firestore';
import { LegalDocument } from '@blockframes/contract/+state/contract.firestore';
import { createParty } from '@blockframes/utils/common-interfaces/identity';
import { ContractVersion } from '../version/+state/contract-version.model';
import { createImgRef } from '@blockframes/utils/image-uploader';


export interface Contract extends ContractDocumentWithDates {
  lastVersion?: ContractVersion;
};

export type ContractPartyDetail = ContractPartyDetailDocumentWithDates;

export type ContractPartyDetailDocument = ContractPartyDetailDocumentWithDatesDocument;

/**
 * @dev this should not be saved to firestore,
 * used only in front
 */
export interface ContractWithLastVersion {
  doc: Contract;
  last: ContractVersion;
}
export function createContract(params: Partial<Contract> = {}): Contract {
  return {
    id: params.id ? params.id : '',
    parties: [],
    titleIds: [],
    partyIds: [],
    ...params
  };
}

export function createContractVersion(params: Partial<ContractVersion> = {}): ContractVersion {
  return {
    id: params.id ? params.id : '1',
    titles: {},
    creationDate: new Date(),
    ...params,
    status: ContractStatus.submitted,
    scope: createTerms(params.scope),
    price: createPrice(params.price)
  };
}

export function createContractTitleDetail(
  params: Partial<ContractTitleDetail> = {}
): ContractTitleDetail {
  return {
    titleId: '',
    distributionDealIds: [],
    ...params,
    price: createPrice(params.price)
  };
}

export function createContractPartyDetail(
  params: Partial<ContractPartyDetail> = {}
): ContractPartyDetail {
  return {
    status: ContractStatus.unknown,
    ...params,
    party: createParty(params.party),
  };
}

export function initContractWithVersion(): ContractWithLastVersion {
  return {
    doc: createContract(),
    last: createContractVersion()
  };
}

export function createPartyDetails(params: Partial<ContractPartyDetail>) {
  return {
    status: '',
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
    p => p.party.role === getCodeIfExists('LEGAL_ROLES', 'licensee')
  );
  const licensors = contract.parties.filter(
    p => p.party.role === getCodeIfExists('LEGAL_ROLES', 'licensor')
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

/**
 * Fetch parties related to a contract given a specific legal role
 * @param contract
 * @param legalRole
 */
export function getContractParties(
  contract: Contract,
  legalRole: LegalRolesSlug
): ContractPartyDetail[] {
  return contract.parties.filter(p => p.party.role === getCodeIfExists('LEGAL_ROLES', legalRole as ExtractCode<'LEGAL_ROLES'>));
}

export function buildChainOfTitle() {
  // ie:  calculate contract prices and fees for each parents
  // @todo #1397 implement this
}

/** Function to convert a Contract into a ContractDocument. */
export function convertToContractDocument(params: Partial<Contract> = {}): ContractDocumentWithDates {
  return {
    id: params.id,
    parties: params.parties || [],
    titleIds: params.titleIds || [],
    partyIds: params.partyIds ||[]
  };
}

export function createLegalDocuments() {
  return {
    chain_of_titles: [],
    invoices: [],
    bill : null
  }
}

export function createLegalDocument(
  legalDocument: Partial<LegalDocument> = {}
): LegalDocument {
  return { 
    label: '',
    media: createImgRef(legalDocument.media),
  }
}
