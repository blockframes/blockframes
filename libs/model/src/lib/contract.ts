import { DocumentMeta, createDocumentMeta } from './meta';
import type { Media, Territory, ContractStatus } from './static';
import { Timestamp } from './timestamp';
import { toDate } from '@blockframes/utils/helpers';
import { createMailTerm, Duration } from './terms';
import { BucketContract } from './bucket';

export function createMailContract(contract: BucketContract<Timestamp>) {
  const formatter = new Intl.NumberFormat('en-US');
  const price = contract.price ? formatter.format(contract.price) : '';

  return ({
    ...contract,
    price,
    terms: createMailTerm(contract.terms)
  });
}

export interface Holdback<D extends Timestamp | Date = Date> {
  territories: Territory[];
  medias: Media[];
  duration: Duration<D>;
}

export interface Contract<D extends Timestamp | Date = Date> {
  _meta: DocumentMeta<D>;
  id: string;
  type: 'mandate' | 'sale';
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

export interface Mandate<D extends Timestamp | Date = Date> extends Contract<D> {
  type: 'mandate';
}

export interface Sale<D extends Timestamp | Date = Date> extends Contract<D> {
  type: 'sale';
  /** Create the anccestors organization when you create the sale */
  ancestors: string[]; // ??? The orgs that have a parent contract with the
  // incomeId: string; // Id of the terms/right on which income should occurred
  /** Free text provided by the buyer, addressed to the seller */
  specificity?: string;
  delivery?: string;
  declineReason?: string;
  holdbacks: Holdback<D>[];
}

export type ContractDocument = Mandate<Timestamp> | Sale<Timestamp>;

export type MailContract = ReturnType<typeof createMailContract>;

export function createHoldback(params: Partial<Holdback<Date>> = {}): Holdback {
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

export function convertDuration(duration: Duration<Date | Timestamp>): Duration<Date> {
  return {
    from: toDate(duration.from),
    to: toDate(duration.to),
  }
}
