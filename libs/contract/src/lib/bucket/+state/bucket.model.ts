import { AvailsFilter } from '@blockframes/contract/avails/avails';
import { createHoldback, Mandate } from '@blockframes/contract/contract/+state';
import { createLanguageKey } from '@blockframes/movie/+state';
import { Term, BucketTerm } from '../../term/+state/term.model';
import { Bucket, BucketContract } from './bucket.firestore';
export { BucketContract, Bucket } from './bucket.firestore';

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
    price: null,
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

