import { firestore } from "firebase/app";
import { TermsRaw } from "@blockframes/utils/common-interfaces/terms";
import { Party } from "@blockframes/utils/common-interfaces/identity";
import { Price } from "@blockframes/utils/common-interfaces/price";
import { LegalRolesSlug } from "@blockframes/movie/movie/static-model/types";

type Timestamp = firestore.Timestamp;

export enum ContractStatus { 
  submitted = 'submitted',
  accepted = 'accepted',
  paid = 'paid',
  unknown = 'unknown',
  undernegotiation = 'under negotiation',
  waitingsignature = 'waiting for signature',
  waitingpaiment = 'waiting for paiment',
  rejected = 'rejected',
  aborted = 'abordted',
}

export interface ContractTitleDetail {
  /**
   * @dev titleId is replacing movieId
   * since we are going to handle series, movies etc..
   */
  titleId: string,
  price: Price,
  distributionDealIds: string[];
}

interface ContractPartyDetailRaw<D> {
  party: Party,
  signDate?: D,
  status: ContractStatus,
  /**
   * Legal role of this party for child contracts.
   * @dev Use this to set which role this party will have for child contracts
   * For example, the licensor for a movie can have to approve sub-sells of the license for this movie.
   */
  childRole?: LegalRolesSlug,
}

/**
 * Subcollection of a contract document.
 * @dev Allows to handle multiple version of a contract
 */
interface ContractVersionRaw<D> {
  id: string,
  status: ContractStatus,
  scope: TermsRaw<D>,
  creationDate?: D,
  titles: Record<string, ContractTitleDetail>,
  price: Price;
  paymentSchedule?: string; // @todo #1397 change this when creating invoices
}

interface ContractRaw<D> {
  id: string,
  parentContractIds?: string[],
  childContractIds?: string[],
  parties: ContractPartyDetailRaw<D>[],
  titleIds: string[],
}

/*
export interface InvoiceRaw<D> {
   @todo #1397
}
*/

export interface ContractDocumentWithDates extends ContractRaw<Date> {
}

export interface ContractDocument extends ContractRaw<Timestamp> {
}

export interface ContractPartyDetailDocumentWithDates extends ContractPartyDetailRaw<Date> {
}

export interface ContractPartyDetailDocumentWithDatesDocument extends ContractPartyDetailRaw<Timestamp> {
}

export interface ContractVersionDocumentWithDates extends ContractVersionRaw<Date> {
}

export interface ContractVersionDocument extends ContractVersionRaw<Timestamp> {
}
