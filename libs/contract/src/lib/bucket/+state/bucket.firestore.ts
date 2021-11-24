import { ContractStatus, Holdback } from '@blockframes/contract/contract/+state/contract.firestore';
import { BucketTerm } from '@blockframes/contract/term/+state/term.firestore';
import type { MovieCurrency } from '@blockframes/utils/static-model';

export interface Bucket {
  id: string;
  currency: MovieCurrency;
  /** One contract per orgId / titleId / parent terms Id */
  contracts: BucketContract[];
  specificity: string;
  delivery: string;
  /** Needed to show user in email to business team */
  uid?: string;
}

export interface BucketContract {
  titleId: string;
  /** The orgId that own the contract (mandate in this case) that  */
  orgId: string;
  /** Price used to create the income */
  price: number;
  /** Parent terms on which the contract is create. */
  parentTermId: string;
  /** List of sub terms derived from the parent terms that the buyer want to buy */
  terms: BucketTerm[];
  specificity: string;
  holdbacks: Holdback<Date>[];
  status:ContractStatus;
}
