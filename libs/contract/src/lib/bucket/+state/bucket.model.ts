import { AvailsFilter } from '@blockframes/contract/avails/avails';
import { createHoldback, Holdback, Mandate } from '@blockframes/contract/contract/+state';
import { createLanguageKey } from '@blockframes/movie/+state';
import { MovieCurrency } from '@blockframes/utils/static-model';
import { Term, BucketTerm } from '../../term/+state/term.model';

export interface Bucket {
  id: string;
  currency: MovieCurrency;
  /** One contract per orgId / titleId / parent terms Id */
  contracts: BucketContract[];
  specificity: string;
  delivery: string;
  /** Needed to show user in email to business team */
  uid?: string;
}

export interface BucketContract {
  titleId: string;
  /** The orgId that own the contract (mandate in this case) that  */
  orgId: string;
  /** Price used to create the income */
  price: number;
  /** Parent terms on which the contract is create. */
  parentTermId: string;
  /** List of sub terms derived from the parent terms that the buyer want to buy */
  terms: BucketTerm[];
  specificity: string;
  holdbacks: Holdback<Date>[];
}


export function toBucketTerm(avail: AvailsFilter): BucketTerm {
  return createBucketTerm({
    medias: avail.medias,
    duration: avail.duration,
    territories: avail.territories,
    exclusive: avail.exclusive,
  });
}

export function createBucketTerm(params: Partial<BucketTerm> = {}): BucketTerm {
  return {
    territories: [],
    medias: [],
    exclusive: false,
    duration: { from: new Date(), to: new Date() },
    ...params,
    languages: createLanguageKey(params.languages),
  }
}

export function createBucketContract(params: Partial<BucketContract> = {}): BucketContract {
  return {
    titleId: '',
    orgId: '',
    price: null ,
    parentTermId: '',
    specificity: '',
    ...params,
    terms: params.terms?.map(createBucketTerm) ?? [],
    holdbacks: params.holdbacks?.map(createHoldback) ?? [],
  }
}

export function toBucketContract(contract: Mandate, term: Term<Date>, avails: AvailsFilter): BucketContract {
  return createBucketContract({
    titleId: contract.titleId,
    orgId: contract.sellerId,
    parentTermId: term.id,
    terms: [toBucketTerm(avails)]
  });
}

export function createBucket(params: Partial<Bucket> = {}): Bucket {
  return {
    id: '',
    currency: 'EUR',
    specificity: '',
    delivery: '',
    ...params,
    contracts: params.contracts?.map(createBucketContract) ?? []
  }
}

