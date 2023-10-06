import { BucketContract } from './bucket';
import { DocumentMeta } from './meta';
import { ContractStatus, MovieCurrency, NegotiationStatus } from './static';

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

export function isInitial(negotiation: Partial<Negotiation>) {
  if (!negotiation?._meta) return true;
  const initial = negotiation.initial;
  const createdAt = negotiation._meta?.createdAt;
  initial?.setSeconds(0, 0);
  createdAt?.setSeconds(0, 0);

  return initial?.getTime() === createdAt?.getTime();
}

export function getNegotiationStatus(negotiation: Negotiation): ContractStatus {
  const pending = negotiation?.status === 'pending';
  if (isInitial(negotiation) && pending) return 'pending';
  if (negotiation?.status === 'pending') return 'negotiating';
  return negotiation?.status;
}