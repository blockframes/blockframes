import { BucketContract } from './bucket';
import { Timestamp } from './timestamp';
import { DocumentMeta } from './meta';
import { MovieCurrency, NegotiationStatus } from '@blockframes/utils/static-model';

// We extends the BucketContract with some information for rules
export interface Negotiation<T extends Date | Timestamp = Date> extends BucketContract<T> {
  _meta: DocumentMeta<T>;
  id: string;
  /** Id of the org that created the negotiation */
  createdByOrg: string;
  /** list of companies involved by this contract */
  stakeholders: string[];
  /** Always Archipel Content in our case */
  sellerId: string;
  /** The org that want to buy the title */
  buyerId: string;
  declineReason?: string;
  status: NegotiationStatus;
  initial: T;
  currency: MovieCurrency
}

export type NegotiationDocument = Negotiation<Timestamp>;
