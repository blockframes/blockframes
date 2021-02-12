import { MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";

export interface Term<T> {
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
