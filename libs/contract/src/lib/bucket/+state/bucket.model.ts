import { Media, Territory } from '@blockframes/utils/static-model';

export interface Bucket {
  currency: 'euro' | 'dollar';
  /** One contract per orgId / titleId / parent terms Id */
  contracts: {
    titleId: string;
    /** The orgId that own the contract (mandate in this case) that  */
    orgId: string;
    /** Price used to create the income */
    price: number;
    /** Parent terms on which the contract is create. */
    parentTermId: string;
    /** List of sub terms derived from the parent terms that the buyer want to buy */
    terms: {
      territories: Territory[];
      media: Media[];
      exclusive: boolean;
      duration: { from: Date, to: Date };
    }[];
  }[];
}