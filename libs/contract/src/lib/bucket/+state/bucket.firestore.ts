import { MailContract } from '@blockframes/contract/contract/+state/contract.firestore';
import { Holdback } from '@blockframes/contract/contract/+state/contract.firestore';
import { BucketTerm } from '@blockframes/model';
import type { MovieCurrency } from '@blockframes/utils/static-model';
import type firebase from 'firebase'

export interface Bucket<T extends Date | firebase.firestore.Timestamp = Date>  {
  id: string;
  currency: MovieCurrency;
  /** One contract per orgId / titleId / parent terms Id */
  contracts: BucketContract<T>[];
  specificity: string;
  delivery: string;
  /** Needed to show user in email to business team */
  uid?: string;
}

export interface BucketContract<T extends Date | firebase.firestore.Timestamp = Date> {
  titleId: string;
  /** The orgId that own the contract (mandate in this case) that  */
  orgId: string;
  /** Price used to create the income */
  price: number;
  /** Parent terms on which the contract is create. */
  parentTermId: string;
  /** List of sub terms derived from the parent terms that the buyer want to buy */
  terms: BucketTerm<T>[];
  specificity: string;
  holdbacks: Holdback<Date>[];
}

//To be used for sending mails.
export interface MailBucket {
  id: string;
  currency: MovieCurrency;
  /** One contract per orgId / titleId / parent terms Id */
  contracts: MailContract[];
  specificity: string;
  delivery: string;
  /** Needed to show user in email to business team */
  uid?: string;
}
