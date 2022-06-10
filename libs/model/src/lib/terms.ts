import { Media, Territory, staticModel } from './static';
import { format } from 'date-fns';
import { LanguageRecord } from './movie';
import { toLanguageVersionString } from './utils';

export function createMailTerm(terms: BucketTerm[]) {
  return terms.map((term) => ({
    ...term,
    territories: term.territories
      .map((territory) => staticModel['territories'][territory])
      .join(', '),
    medias: term.medias.map((media) => staticModel['medias'][media] ?? media).join(', '),
    duration: {
      from: format(term.duration.from, 'dd MMM, yyyy'),
      to: format(term.duration.to, 'dd MMM, yyyy'),
    },
    languages: toLanguageVersionString(term.languages),
    exclusive: term.exclusive ? 'Exclusive' : 'Non exclusive',
  }));
}

export type MailTerm = ReturnType<typeof createMailTerm>[number];

export interface Duration {
  from: Date;
  to: Date;
}

export interface BucketTerm {
  medias: Media[];
  duration: Duration;
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
export interface Term extends BucketTerm {
  id: string;
  contractId: string;
  criteria: unknown[];
  licensedOriginal: boolean;
}

export function createTerm(params: Partial<Term> = {}): Term {
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
