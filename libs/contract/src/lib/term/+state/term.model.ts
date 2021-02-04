import { MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";

export interface Term {
  id: string;  // Use same id than right & terms
  // Start Query //
  titleId: string;
  orgId: string;
  territories: string[];
  medias: string[];
  licensedOriginal: boolean;
  exclusive: boolean;
  duration: { from: Date, to: Date };
  // End Query //
  // Vanity information
  languages: Record<string, MovieLanguageSpecification>;
  criteria: any[];

}
