import { Mandate } from '@blockframes/contract/contract/+state';
import { Term } from '@blockframes/contract/term/+state';
import { createLanguageKey } from '@blockframes/movie/+state';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { Media, MovieCurrency, Territory } from '@blockframes/utils/static-model';

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
}

export interface BucketTerm {
  medias: Media[];
  duration: { from: Date, to: Date };
  territories: Territory[];
  exclusive: boolean;
  languages: Record<string, MovieLanguageSpecification>;
  runs?: {
    broadcasts: number;
    catchup: {
      from: Date,
      duration: number,
      period: 'day' | 'week' | 'month'
    }
  }
}

export function toBucketTerm(term: Term): BucketTerm {
  return createBucketTerm({
    medias: term.medias,
    duration: term.duration,
    territories: term.territories,
    exclusive: term.exclusive,
    languages: term.languages,
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
    price: 0,
    parentTermId: '',
    specificity: '',
    ...params,
    terms: params.terms?.map(createBucketTerm) ?? []
  }
}


export function toBucketContract(contract: Mandate, terms: Term[] = []): BucketContract {
  return createBucketContract({
    titleId: contract.titleId,
    orgId: contract.sellerId,
    parentTermId: contract.parentTermId,
    terms: terms.map(toBucketTerm)
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

