import { MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";
import { Media, Territory } from "@blockframes/utils/static-model";
import type firebase from 'firebase'

export interface Duration<T extends Date | firebase.firestore.Timestamp = Date> {
  from: T,
  to: T,
}

/**
 * Continue term that describe a contract
 * Discontinuity criteria are :
 * - only one Right can have the same ID
 * - exclusivity should be the same
 * - duration cannot be splitted
 */
export interface Term<T extends Date | firebase.firestore.Timestamp = Date> {
  id: string;
  contractId: string;
  territories: Territory[];
  medias: Media[];
  licensedOriginal: boolean;
  exclusive: boolean;
  duration: Duration<T>;
  languages: Record<string, MovieLanguageSpecification>;
  criteria: unknown[];
  runs?: {
    broadcasts: number;
    catchup: {
      from: Date,
      duration: number,
      period: 'day' | 'week' | 'month'
    }
  }
}

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
