import { MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";
import { Media, Territory } from "@blockframes/utils/static-model";
import type firebase from 'firebase'

/**
 * Continue term that describe a contract
 * Discontinuity criteria are :
 * - only one Right can have the same ID
 * - exclusivity should be the same
 * - duration cannot be splitted
 */
export interface Term<T extends Date | firebase.firestore.Timestamp = Date> {
  id: string;
  orgId: string;
  contractId: string;
  territories: Territory[];
  medias: Media[];
  licensedOriginal: boolean;
  exclusive: boolean;
  duration: { from: T, to: T };
  languages: Record<string, MovieLanguageSpecification>;
  criteria: any[];
}

export function createTerm(params: Partial<Term<Date>> = {}): Term<Date> {
  return {
    id: '',
    orgId: '',
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