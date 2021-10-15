
import { createDocumentMeta } from "@blockframes/utils/models-meta";
import { Duration } from '../../term/+state/term.model';
import { Timestamp } from "@blockframes/utils/common-interfaces/timestamp";
import { toDate } from "@blockframes/utils/helpers";
import { Contract, Holdback, Mandate, Sale } from "./contract.firestore";
export { contractStatus, ContractStatus, Holdback, Contract, Mandate, Sale, ContractDocument } from './contract.firestore';

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
