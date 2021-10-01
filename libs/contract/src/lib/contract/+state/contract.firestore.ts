
import { DocumentMeta } from "@blockframes/utils/models-meta";
import type { Media, Territory } from "@blockframes/utils/static-model";
import { Duration } from '../../term/+state/term.firestore';
import { Timestamp } from "@blockframes/utils/common-interfaces/timestamp";

export const contractStatus = ['pending', 'accepted', 'declined', 'archived'] as const;

export type ContractStatus = typeof contractStatus[number];

export interface Holdback<D extends Timestamp | Date = Date> {
  territories: Territory[];
  medias: Media[];
  duration: Duration<D>;
}

export interface Contract<D extends Timestamp | Date = Date> {
  _meta: DocumentMeta<D>;
  id: string;
  type: 'mandate' | 'sale';
  status: ContractStatus;
  titleId: string;
  /** Parent term on which this contract is created */
  parentTermId: string;
  /** List of discontinued terms */
  termIds: string[];
  /** Offer in which the contract is included is any */
  offerId?: string;
  /** The id of the buyer's org, can be undefined if external sale */
  buyerId?: string;
  /** The user id of the buyer, can be undefined if external sale */
  buyerUserId?: string;
  /** Id of the direct seller. AC in the Archipel Content app */
  sellerId: string;
  /** Org ids that have contract parent of this contract */
  stakeholders: string[];
}

export interface Mandate<D extends Timestamp | Date = Date> extends Contract<D> {
  type: 'mandate';
}
export interface Sale<D extends Timestamp | Date = Date> extends Contract<D> {
  type: 'sale';
  /** Create the anccestors organization when you create the sale */
  ancestors: string[]; // ??? The orgs that have a parent contract with the
  // incomeId: string; // Id of the terms/right on which income should occurred
  /** Free text provided by the buyer, addressed to the seller */
  specificity?: string;
  delivery?: string;
  declineReason?:string;
  holdbacks: Holdback<D>[];
}

export type ContractDocument = Mandate<Timestamp> | Sale<Timestamp>;
