import { DateRange } from '@blockframes/utils/common-interfaces/date-range';
import { Price, createPrice } from '@blockframes/utils/common-interfaces/price';
import { ContractDocumentWithDates, ContractStatus, ContractTitleDetail } from './cart.firestore';
import { createTerms } from '@blockframes/utils/common-interfaces/terms';
import { getCodeIfExists } from '@blockframes/movie/movie/static-model/staticModels';

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

export interface MovieData { // @TODO (#1388) check this object
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
    id: params.id,
    parties: [],
    titles: {},
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

/**
 * @param contract
 */
export function validateContract(contract: Contract): boolean {

  // First, contract must have at least a licensee and a licensor

  if (contract.parties.length < 2) { return false; }
  const licensees = contract.parties.filter(p => p.role == getCodeIfExists('LEGAL_ROLES', 'licensee'))
  const licensors = contract.parties.filter(p => p.role == getCodeIfExists('LEGAL_ROLES', 'licensor'))

  if (!licensees.length || !licensors.length) { return false; }

  for(const licensee of licensees) {
    if(licensee.orgId === undefined) {
      delete licensee.orgId
    }
    if(typeof licensee.showName !== 'boolean') {
      return false;
    }
  }

  for(const licensor of licensors) {
    if(licensor.orgId === undefined) {
      delete licensor.orgId
    }
    if(typeof licensor.showName !== 'boolean') {
      return false;
    }
  }

  // Other contract validation steps goes here 
  // ...
  
  return true;
}
