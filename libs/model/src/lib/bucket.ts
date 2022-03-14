import { AvailsFilter, CalendarAvailsFilter, MapAvailsFilter } from '@blockframes/contract/avails/avails';
import { Holdback, MailContract } from '@blockframes/contract/contract/+state/contract.firestore';
import { BucketTerm, Term } from '@blockframes/contract/term/+state/term.firestore';
import { createHoldback, Mandate } from '@blockframes/contract/contract/+state';
import { createLanguageKey } from '@blockframes/model';
import type { MovieCurrency } from '@blockframes/utils/static-model';
import type firebase from 'firebase';

export interface Bucket<T extends Date | firebase.firestore.Timestamp = Date>  {
  id: string;
  currency: MovieCurrency;
  /** One contract per orgId / titleId / parent terms Id */
  contracts: BucketContract<T>[];
  specificity: string;
  delivery: string;
  /** Needed to show user in email to business team */
  uid?: string;
}

export interface BucketContract<T extends Date | firebase.firestore.Timestamp = Date> {
  titleId: string;
  /** The orgId that own the contract (mandate in this case) that  */
  orgId: string;
  /** Price used to create the income */
  price: number;
  /** Parent terms on which the contract is create. */
  parentTermId: string;
  /** List of sub terms derived from the parent terms that the buyer want to buy */
  terms: BucketTerm<T>[];
  specificity: string;
  holdbacks: Holdback<Date>[];
}

//To be used for sending mails.
export interface MailBucket {
  id: string;
  currency: MovieCurrency;
  /** One contract per orgId / titleId / parent terms Id */
  contracts: MailContract[];
  specificity: string;
  delivery: string;
  /** Needed to show user in email to business team */
  uid?: string;
}

export function toBucketTerm(
  avail: AvailsFilter | MapAvailsFilter | CalendarAvailsFilter
): BucketTerm {
  return createBucketTerm({
    medias: avail.medias,
    duration: 'duration' in avail ? avail.duration : undefined,
    territories: 'territories' in avail ? avail.territories : undefined,
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

export function toBucketContract(
  contract: Mandate,
  term: Term<Date>,
  avails: AvailsFilter | MapAvailsFilter | CalendarAvailsFilter
): BucketContract {
  return createBucketContract({
    titleId: contract.titleId,
    orgId: contract.sellerId,
    parentTermId: term.id,
    terms: [toBucketTerm(avails)],
  });
}

export function createBucket(params: Partial<Bucket> = {}): Bucket {
  return {
    id: '',
    currency: 'EUR',
    specificity: '',
    delivery: '',
    ...params,
    contracts: params.contracts?.map(createBucketContract) ?? [],
  };
}