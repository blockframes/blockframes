import { firestore } from "firebase/app";
import { TermsRaw } from "@blockframes/utils/common-interfaces/terms";
import { Party } from "@blockframes/utils/common-interfaces/identity";
import { Price, PaymentStatus, Payment, createPrice, PriceRaw } from "@blockframes/utils/common-interfaces/price";
import {
  TerritoriesSlug,
  LanguagesSlug,
  LegalRolesSlug
} from "@blockframes/utils/static-model/types";
import { ImgRef } from "@blockframes/utils/image-uploader";
import { PaymentScheduleRaw } from "@blockframes/utils/common-interfaces/schedule";
import { BankAccount } from "@blockframes/utils/common-interfaces/utility";

type Timestamp = firestore.Timestamp;

export enum ContractStatus {
  submitted = 'submitted',
  accepted = 'accepted',
  paid = 'paid',
  unknown = 'unknown',
  undernegotiation = 'under negotiation',
  waitingsignature = 'waiting for signature',
  waitingpaiment = 'waiting for payment',
  rejected = 'rejected',
  aborted = 'aborted',
}

export const enum ContractType {
  mandate = 'Mandate',
  sale = 'Sale'
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
   * Legal role(s) of this party for child contracts.
   * @dev Use this to set which role(s) this party will have for child contracts
   * For example, the licensor for a movie can have to approve sub-sells of the license for this movie.
   * A more explicit naming would have been: rolesForChildContracts
   */
  childRoles?: LegalRolesSlug[],
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
  paymentSchedule?: PaymentScheduleRaw<D>[];
}

interface ContractRaw<D> {
  id: string,
  /**
   * @dev to facilitate firebase queries 
   * (instead of doing query in two steps)
   */
  type: ContractType,
  parentContractIds?: string[],
  childContractIds?: string[],
  /** @dev an informative signature date, given that the actual signatures are in parties */
  signDate?: D,
  parties: ContractPartyDetailRaw<D>[],
  titleIds: string[],
  partyIds: string[],
  documents: LegalDocuments
}

export interface InvoiceTitleDetailsRaw<D> {
  price: PriceRaw<D>;
  reportId?: string;
  titleId: string;
}

export interface InvoiceTitleDetails extends InvoiceTitleDetailsRaw<Date> {
}

export interface InvoiceTitleDetailsDocument extends InvoiceTitleDetailsRaw<Timestamp> {
}

export interface InvoiceRaw<D> {
  id: string,
  internalRef: string,
  /** @dev should be comming from blockchain data */
  paymentRef?: string,
  payments: Payment[],
  emittedDate: D,
  /**
   * @dev Contains Ids of titles that this invoice is about
   */
  titles: InvoiceTitleDetailsRaw<D>[],
  /**
   * @dev Expected price once each payments have been made
   */
  price: Price,
  /**
   * @dev Collected amount (sum of payments.price).
   * A function should handle this.
   * Start with zero.
   */
  collected: Price,
  /** @dev an orgId */
  buyerId: string,
  /** @dev an orgId */
  sellerId: string,
  paymentSchedule: PaymentScheduleRaw<D>,
  /**
   * @dev Status calculated with price - collected
   * A function should handle this.
   * Start with PaymentStatus.notdueyet
   */
  status: PaymentStatus,
  interestRate?: number,
  /** @dev should be one of the buyerId bank accounts */
  account: BankAccount,
  contractId: string,
  /** @dev should be a legal document belonging to contractId */
  legalDocumentId: string,
  /**
   * @dev
   * reportIds : array of FinancialReport ids
   * reportInternalRefs : array of FinancialReport interalRef
   */
  reportIds: string[],
  reportInternalRefs: string[],
}

export interface LegalDocuments {
  chainOfTitles: LegalDocument[],
  invoices: LegalDocument[]
}

export interface LegalDocument {
  id: string,
  label: string,
  media: ImgRef,
  language?: LanguagesSlug,
  country?: TerritoriesSlug,
}

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

export interface Invoice extends InvoiceRaw<Date> {
}

export interface InvoiceDocument extends InvoiceRaw<Timestamp> {
}
