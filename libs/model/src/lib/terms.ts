import { Media, MovieCurrency, Territory } from './static';
import { LanguageRecord } from './movie';
import { decodeDate } from './utils';

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
  titleId?: string;
  criteria: unknown[];
  licensedOriginal: boolean;
  price?: number;
  currency?: MovieCurrency;
}

export function createTerm(params: Partial<Term> = {}): Term {
  return {
    id: '',
    contractId: '',
    territories: [],
    medias: [],
    exclusive: false,
    licensedOriginal: null,
    languages: {},
    criteria: [],
    ...params,
    duration: createDuration(params?.duration),
  };
}

export function createDuration(params: Partial<Duration> = {}): Duration {
  return { from: decodeDate(params?.from), to: decodeDate(params?.to) };
}

export function isInPast(duration: Duration) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return duration.from < now || duration.to < now;
}
