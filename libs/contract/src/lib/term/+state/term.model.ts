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
  titleId: string;
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

interface Bucket {
  currency: 'euro' | 'dollar';
  /** One contract per orgId / titleId / parent terms Id */
  contracts: {
    titleId: string;
    /** The orgId that own the contract (mandate in this case) that  */
    orgId: string;
    /** Price used to create the income */
    price: number;
    /** Parent term on which the contract is create */
    parentTermId: string;
    /** List of sub terms derived from the parent terms that the buyer want to buy */
    terms: {
      territories: string[];
      media: string[];
      exclusive: boolean;
      duration: { from: Date, to: Date };
    }[];
  }[];
}