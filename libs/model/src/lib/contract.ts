import { Income } from './income';
import { DocumentMeta, createDocumentMeta } from './meta';
import { Negotiation } from './negociation';
import type { Media, Territory, ContractStatus, ContractType, MovieCurrency } from './static';
import { Duration, Term } from './terms';
import { PricePerCurrency, sortByDate } from './utils';

export interface Holdback {
  territories: Territory[];
  medias: Media[];
  duration: Duration;
}

export interface BaseContract {
  _meta: DocumentMeta;
  id: string;
  type: string;
  status: ContractStatus;
  titleId: string;
  signatureDate?: Date;
  price?: number;
  currency?: MovieCurrency;
  duration?: Duration;
  /** List of discontinued terms */
  termIds: string[];
  /** The id of the buyer's org, can be undefined if external sale */
  buyerId: string;
  /** Id of the direct seller. AC in the Archipel Content app */
  sellerId: string;
  /** Org ids that have contract parent of this contract */
  stakeholders: string[];
  /** If contract is an amendment, provide root contract Id */
  rootId: string;
}

export interface Contract extends BaseContract {
  type: ContractType;
  /** Parent term on which this contract is created */
  parentTermId: string;
  /** Offer in which the contract is included is any */
  offerId: string;
  /** The user id of the buyer, can be undefined if external sale */
  buyerUserId: string;
}

export interface Mandate extends Contract {
  type: 'mandate';
}

export interface Sale extends Contract {
  type: 'sale';
  /** Create the ancestors organization when you create the sale */
  ancestors: string[]; // ??? The orgs that have a parent contract with the
  // incomeId: string; // Id of the terms/right on which income should occurred
  /** Free text provided by the buyer, addressed to the seller */
  specificity?: string;
  declineReason?: string;
  holdbacks: Holdback[];
}

export interface FullMandate extends Mandate {
  terms: Term[];
}
export interface FullSale extends Sale {
  terms: Term[];
}

export interface DetailedContract extends Contract {
  licensor: string;
  licensee: string;
  title: string;
  // For internal contracts
  negotiation?: Negotiation;
  // For external & internal contracts
  incomes?: Income[];
  totalIncome?: PricePerCurrency;
}

export function createHoldback(params: Partial<Holdback> = {}): Holdback {
  return {
    territories: [],
    medias: [],
    duration: { from: new Date(), to: new Date() },
    ...params,
  }
}

export function createMandate(params: Partial<Mandate> = {}): Mandate {
  return {
    _meta: createDocumentMeta({}),
    id: '',
    titleId: '',
    termIds: [],
    offerId: '',
    parentTermId: '',
    buyerId: '', // For external sales this is undefined
    buyerUserId: '', // For external sales this is undefined
    sellerId: '', // Archipel content or the Seller
    type: 'mandate',
    status: 'pending',
    stakeholders: [],
    rootId: '',
    ...params
  }
}

export function createSale(params: Partial<Sale> = {}): Sale {
  return {
    _meta: createDocumentMeta({}),
    id: '',
    titleId: '',
    termIds: [],
    offerId: '',
    parentTermId: '',
    ancestors: [],
    buyerId: '', // For external sales this is undefined
    buyerUserId: '', // For external sales this is undefined
    specificity: '',
    sellerId: '', // Archipel content or the Seller
    type: 'sale',
    status: 'pending',
    stakeholders: [],
    holdbacks: [],
    rootId: '',
    ...params
  }
}

export function createContract(params: Partial<Contract>) {
  if (isMandate(params)) return createMandate(params);
  if (isSale(params)) return createSale(params);
}

export function isMandate(contract: Partial<BaseContract>): contract is Mandate {
  return contract.type === 'mandate';
}

export function isSale(contract: Partial<BaseContract>): contract is Sale {
  return contract.type === 'sale';
}

/**
 * Returns declared amount of a contract.
 * Amount can be located on contract document or on its terms for more detailed data
 * @param contract 
 * @returns 
 */
export function getDeclaredAmount(contract: BaseContract & { terms: Term[] }): PricePerCurrency {
  if (contract.price && contract.price > 0) return { [contract.currency]: contract.price };
  const amount: PricePerCurrency = {};
  contract.terms.forEach(t => {
    amount[t.currency] ||= 0;
    amount[t.currency] += t.price;
  });
  return amount;
}

export function getContractDurationStatus(contract: BaseContract): 'future' | 'past' | 'ongoing' {
  const now = new Date().getTime();
  if (now < contract.duration.from.getTime()) return 'future';
  if (now > contract.duration.to.getTime()) return 'past';
  return 'ongoing';
}

/**
 * Returns the current contracts where one or two parties are involved
 * @param parties
 * @param _contracts 
 * @param date 
 * @param excludedIds
 * @returns 
 */
export function getContractsWith<T extends BaseContract>(parties: string[], _contracts: T[], date = new Date()) {
  const filteredContracts = _contracts.filter(c => !c.rootId);
  const contracts = filteredContracts.map(c => getCurrentContract<T>(getContractAndAmendments<T>(c.id, filteredContracts), date));
  return contracts
    .filter(c => !!c) // Remove contracts that are not active for the given date
    .filter(contract => {
      if (parties.length === 1) return contract.buyerId === parties[0] || contract.sellerId === parties[0];
      const contractParties = [contract.buyerId, contract.sellerId];
      return contractParties.includes(parties[0]) && contractParties.includes(parties[1]);
    });
}

/**
 * Return true if there is at least one current contract where one or two parties are involved
 * @param parties 
 * @param _contracts 
 * @param date 
 * @returns 
 */
export function hasContractWith<T extends BaseContract>(parties: string[], _contracts: T[], date = new Date()) {
  return getContractsWith<T>(parties, _contracts, date).length > 0;
}

// ----------------------------
//    AMENDMENTS MANAGEMENT  //
// ----------------------------

/**
 * Returns the latest contract of a set
 * @param contracts 
 * @returns 
 */
export function getLatestContract<T extends BaseContract>(contracts: T[]) {
  return sortContracts(contracts)[contracts.length - 1];
}

/**
 * Returns all contracts (root and childs), sorted by signature date
 * @param contractId 
 * @param contracts 
 * @returns 
 */
export function getContractAndAmendments<T extends BaseContract>(contractId: string, contracts: T[]) {
  if (!contractId) return [];
  const contract = contracts.find(c => c.id === contractId);
  if (!contract) return [];
  if (contract.rootId) {
    return sortContracts(contracts.filter(c => c.rootId === contract.rootId || c.id === contract.rootId));
  } else {
    return sortContracts(contracts.filter(c => c.rootId === contract.id || c.id === contract.id));
  }
}

/**
 * Returns root or amendment contract that matches date
 * @param contracts 
 * @param date 
 * @returns 
 */
export function getCurrentContract<T extends BaseContract>(contracts: T[], date = new Date()) {
  return sortContracts(contracts).reverse().find(c => c.signatureDate.getTime() <= date.getTime());
}

/**
 * Sorts contracts by signature date
 * @param contracts 
 * @returns 
 */
export function sortContracts<T extends BaseContract>(contracts: T[]) {
  return sortByDate<T>(contracts, 'signatureDate');
}