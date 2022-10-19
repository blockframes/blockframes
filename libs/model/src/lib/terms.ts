import { Media, Territory } from './static';
import { LanguageRecord } from './movie';
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

function randomNumber() {
  return Math.floor(Math.random() * 255);
}

function fakeIp() {
  return randomNumber() + 1 + '.' + randomNumber() + '.' + randomNumber() + '.' + randomNumber();
}

export const fakeLegalTerms = { date: new Date(), ip: fakeIp() };