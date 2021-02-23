import { MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";
import type firebase from 'firebase'

export interface Term<T extends Date | firebase.firestore.Timestamp = Date> {
  id: string;  // Use same id than right & terms
  // Start Query //
  titleId: string;
  orgId: string;
  territories: string[];
  medias: string[];
  licensedOriginal: boolean;
  exclusive: boolean;
  duration: { from: T, to: T };
  // End Query //
  // Vanity information
  languages: Record<string, MovieLanguageSpecification>;
  criteria: any[];

}
