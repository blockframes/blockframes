import { Media, Territory, staticModel } from '@blockframes/utils/static-model';
import type firebase from 'firebase';
import { Timestamp } from './timestamp';
import { format } from 'date-fns';
import { toLanguageVersionString } from '@blockframes/utils/utils';
import { LanguageRecord } from './movie';

export function createMailTerm(terms: BucketTerm<Timestamp>[]) {
  return terms.map((term) => ({
    ...term,
    territories: term.territories
      .map((territory) => staticModel['territories'][territory])
      .join(', '),
    medias: term.medias.map((media) => staticModel['medias'][media] ?? media).join(', '),
    duration: {
      from: format(term.duration.from.toDate(), 'dd MMM, yyyy'),
      to: format(term.duration.to.toDate(), 'dd MMM, yyyy'),
    },
    languages: toLanguageVersionString(term.languages),
    exclusive: term.exclusive ? 'Exclusive' : 'Non exclusive',
  }));
}

export type MailTerm = ReturnType<typeof createMailTerm>[number];

export interface Duration<T extends Date | firebase.firestore.Timestamp = Date> {
  from: T;
  to: T;
}

export interface BucketTerm<T extends Date | firebase.firestore.Timestamp = Date> {
  medias: Media[];
  duration: Duration<T>;
  territories: Territory[];
  exclusive: boolean;
  languages: LanguageRecord;
}

/**
 * Continue term that describe a contract
 * Discontinuity criteria are :
 * - only one Right can have the same ID
 * - exclusivity should be the same
 * - duration cannot be splitted
 */
export interface Term<T extends Date | firebase.firestore.Timestamp = Date> extends BucketTerm<T> {
  id: string;
  contractId: string;
  criteria: unknown[];
  licensedOriginal: boolean;
}

export type TermDocument = Term<firebase.firestore.Timestamp>;

export function createTerm(params: Partial<Term<Date>> = {}): Term<Date> {
  return {
    id: '',
    contractId: '',
    territories: [],
    medias: [],
    exclusive: false,
    duration: { from: new Date(), to: new Date() },
    licensedOriginal: null,
    languages: {},
    criteria: [],
    ...params
  }
}