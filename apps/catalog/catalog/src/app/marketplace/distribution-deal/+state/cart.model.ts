import { DateRange } from '@blockframes/utils/common-interfaces/date-range';
import { Price, createPrice } from '@blockframes/utils/common-interfaces/price';
import { ContractDocumentWithDates, ContractStatus, ContractTitleDetail, ContractVersionDocumentWithDates, ContractPartyDetailDocumentWithDates } from './cart.firestore';
import { createTerms } from '@blockframes/utils/common-interfaces/terms';
import { getCodeIfExists } from '@blockframes/movie/movie/static-model/staticModels';
import { LegalRolesSlug } from '@blockframes/movie/movie/static-model/types';
import { createParty } from '@blockframes/utils/common-interfaces/identity';

export const enum CartStatus {
  pending = 'pending',
  submitted = 'submitted',
  accepted = 'accepted',
  paid = 'paid'
}

export interface CatalogCart {
  name: string;
  status: CartStatus;
  deals: string[];
  price: Price;
}

/**
 * @TODO (#1388) should be removed to use something more like actual movie model 
 */
export interface MovieData {
  id: string;
  movieName: string;
  duration: DateRange;
  territory: string;
  rights: string;
  languages: string;
  dubbed: string;
  subtitle: string;
}

export type Contract = ContractDocumentWithDates;

export type ContractVersion = ContractVersionDocumentWithDates;

export type ContractPartyDetail = ContractPartyDetailDocumentWithDates;

/**
 * @dev this should not be saved to firestore,
 * used only in front
 */
export interface ContractWithLastVersion {
  doc: Contract,
  last: ContractVersion,
}

/**
 * A factory function that creates Cart
 */
export function createCart(cart: Partial<CatalogCart> = {}): CatalogCart {
  return {
    name: 'default',
    status: CartStatus.pending,
    deals: [],
    ...cart,
    price: createPrice(cart.price),
  }
}

export function createContract(params: Partial<Contract> = {}): Contract {
  return {
    id: params.id ? params.id : '',
    parties: [],
    titleIds: [],
    ...params,
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
    price: createPrice(params.price),
  };
}

export function createContractTitleDetail(params: Partial<ContractTitleDetail> = {}): ContractTitleDetail {
  return {
    titleId: '',
    distributionDealIds: [],
    ...params,
    price: createPrice(params.price),
  };
}

export function createContractPartyDetail(params: Partial<ContractPartyDetail> = {}): ContractPartyDetail {
  return {
    party: createParty(params.party),
    status: ContractStatus.unknown,
    ...params,
  };
}

export function createContractWithVersion(): ContractWithLastVersion {
  return {
    doc: createContract(),
    last: createContractVersion(),
  }
}

/**
 * Various validation steps for validating a contract
 * Currently (dec 2019), only validate that there is a licensee and a licensor
 * @param contract
 */
export function validateContract(contract: Contract): boolean {

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

/**
 * 
 * @param contract 
 * @param legalRole 
 */
export function getContractParties(contract: Contract, legalRole: LegalRolesSlug): ContractPartyDetail[] {
  return contract.parties.filter(p => p.party.role === getCodeIfExists('LEGAL_ROLES', legalRole));
}

export function buildChainOfTitle() {
  // ie:  calculate contract prices and fees for each parents
  // @todo #1462 implement this
}
