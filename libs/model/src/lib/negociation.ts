import { BucketContract } from './bucket';
import { DocumentMeta } from './meta';
import { MovieCurrency, NegotiationStatus } from './static';

// We extends the BucketContract with some information for rules
export interface Negotiation extends BucketContract {
  _meta: DocumentMeta;
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
  initial: Date;
  currency: MovieCurrency
}
