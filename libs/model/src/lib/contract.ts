import { isInitial } from '@blockframes/contract/negotiation/utils';
import { Income, TotalIncome, getTotalIncome } from './income';
import { DocumentMeta, createDocumentMeta } from './meta';
import { Movie } from './movie';
import { Negotiation } from './negociation';
import { Organization } from './organisation';
import type { Media, Territory, ContractStatus, ContractType } from './static';
import { Duration, Term } from './terms';
import { getSeller } from '@blockframes/contract/contract/utils';

export interface Holdback {
  territories: Territory[];
  medias: Media[];
  duration: Duration;
}

export interface Contract {
  _meta: DocumentMeta;
  id: string;
  type: ContractType;
  status: ContractStatus;
  titleId: string;
  /** Parent term on which this contract is created */
  parentTermId: string;
  /** List of discontinued terms */
  termIds: string[];
  /** Offer in which the contract is included is any */
  offerId?: string;
  /** The id of the buyer's org, can be undefined if external sale */
  buyerId?: string;
  /** The user id of the buyer, can be undefined if external sale */
  buyerUserId?: string;
  /** Id of the direct seller. AC in the Archipel Content app */
  sellerId: string;
  /** Org ids that have contract parent of this contract */
  stakeholders: string[];
}

export interface Mandate extends Contract {
  type: 'mandate';
}

export interface Sale extends Contract {
  type: 'sale';
  /** Create the anccestors organization when you create the sale */
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
  totalIncome?: TotalIncome;
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
    parentTermId: '',
    buyerId: '', // For external sales this is undefined
    buyerUserId: '', // For external sales this is undefined
    sellerId: '', // Archipel content or the Seller
    type: 'mandate',
    status: 'pending',
    stakeholders: [],
    ...params
  }
}

export function createSale(params: Partial<Sale> = {}): Sale {
  return {
    _meta: createDocumentMeta({}),
    id: '',
    titleId: '',
    termIds: [],
    parentTermId: '',
    ancestors: [],
    buyerId: null, // For external sales this is undefined
    buyerUserId: '', // For external sales this is undefined
    specificity: '',
    sellerId: '', // Archipel content or the Seller
    type: 'sale',
    status: 'pending',
    stakeholders: [],
    holdbacks: [],
    ...params
  }
}

export function isMandate(contract: Contract): contract is Mandate {
  return contract.type === 'mandate';
}

export function isSale(contract: Contract): contract is Sale {
  return contract.type === 'sale';
}

export function contractToDetailedContract(
  contracts: Contract[],
  orgs: Organization[],
  titles: Movie[],
  incomes?: Income[],
  negotiations?: (Negotiation & { contractId: string })[]
) {
  const detailedContracts: DetailedContract[] = contracts.map(c => {
    const detailedContract: DetailedContract = {
      ...c,
      licensor: orgs.find(o => o.id === getSeller(c)).name,
      licensee: orgs.find(o => o.id === c.buyerId)?.name || 'External',
      title: titles.find(t => t.id === c.titleId).title.international,
    };
    if (!incomes) return detailedContract;
    detailedContract.incomes = incomes.filter(i => i.contractId === c.id);
    detailedContract.negotiation = negotiations.find(n => n.contractId === c.id);
    return detailedContract;
  });
  return detailedContracts;
}

export const getPrice = (sale: DetailedContract) => {
  if (sale.buyerId) {
    return `${sale.negotiation?.price || ''} ${sale.negotiation?.currency || ''}`;
  } else {
    const totalIncome = getTotalIncome(sale.incomes);
    const incomes = [];
    if (totalIncome.EUR) incomes.push(`${totalIncome.EUR} 'EUR'`);
    if (totalIncome.USD) incomes.push(`${totalIncome.USD} 'USD'`);
    return incomes.join(' | ');
  }
}

export function getNegotiationStatus(negotiation: Negotiation): ContractStatus {
  const pending = negotiation?.status === 'pending';
  if (isInitial(negotiation) && pending) return 'pending';
  if (negotiation?.status === 'pending') return 'negotiating';
  return negotiation?.status;
}
