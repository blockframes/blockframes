import type { MovieCurrency } from './static';
import { createHoldback, Holdback } from './contract';
import { BucketTerm } from './terms';
import { createLanguageKey } from './movie';

export interface Bucket {
  id: string;
  currency: MovieCurrency;
  /** One contract per orgId / titleId / parent terms Id */
  contracts: BucketContract[];
  specificity: string;
  /** Needed to show user in email to business team */
  uid?: string;
}

export interface BucketContract {
  titleId: string;
  title?: string; // Used only in bucketContract stored in notifications (offerCreatedConfirmation for example)
  /** The orgId that own the contract (mandate in this case) that  */
  orgId: string;
  /** Price used to create the income */
  price?: number;
  /** Parent terms on which the contract is create. */
  parentTermId: string;
  /** List of sub terms derived from the parent terms that the buyer want to buy */
  terms: BucketTerm[];
  specificity: string;
  holdbacks: Holdback[];
}

export function createBucketTerm(params: Partial<BucketTerm> = {}): BucketTerm {
  return {
    territories: [],
    medias: [],
    exclusive: false,
    duration: { from: new Date(), to: new Date() },
    ...params,
    languages: createLanguageKey(params.languages),
  };
}

export function createBucketContract(params: Partial<BucketContract> = {}): BucketContract {
  return {
    titleId: '',
    orgId: '',
    price: null,
    parentTermId: '',
    specificity: '',
    ...params,
    terms: params.terms?.map(createBucketTerm) ?? [],
    holdbacks: params.holdbacks?.map(createHoldback) ?? [],
  };
}

export function createBucket(params: Partial<Bucket> = {}): Bucket {
  return {
    id: '',
    currency: 'EUR',
    specificity: '',
    ...params,
    contracts: params.contracts?.map(createBucketContract) ?? [],
  };
}
