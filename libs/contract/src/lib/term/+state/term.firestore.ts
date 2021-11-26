import { MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";
import type { Media, Territory } from "@blockframes/utils/static-model";
import type firebase from 'firebase'

export interface Duration<T extends Date | firebase.firestore.Timestamp = Date> {
  from: T,
  to: T,
}

export interface BucketTerm<T extends Date | firebase.firestore.Timestamp = Date> {
  medias: Media[];
  duration: Duration<T>;
  territories: Territory[];
  exclusive: boolean;
  languages: Record<string, MovieLanguageSpecification>;
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
