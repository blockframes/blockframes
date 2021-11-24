import { BucketContract } from "@blockframes/contract/bucket/+state";
import { ContractStatus } from "@blockframes/contract/contract/+state/contract.firestore";
import { DocumentMeta } from "@blockframes/utils/models-meta";
import type firebase from 'firebase'

// We extends the BucketContract with some information for rules
export interface Negotiation<T extends Date | firebase.firestore.Timestamp = Date> extends BucketContract {
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
  status:ContractStatus;
}
