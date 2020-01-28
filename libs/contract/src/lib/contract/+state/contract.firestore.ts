import { firestore } from "firebase/app";
import { TermsRaw } from "@blockframes/utils/common-interfaces/terms";
import { Party } from "@blockframes/utils/common-interfaces/identity";
import { Price } from "@blockframes/utils/common-interfaces/price";
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
  parentContractIds?: string[],
  childContractIds?: string[],
  parties: ContractPartyDetailRaw<D>[],
  titleIds: string[],
  partyIds: string[],
  documents: LegalDocuments
}

export interface InvoiceRaw<D> {
  id: string,
  internalRef: string,
  /** @dev should be comming from blockchain data */
  paymentRef?: string,
  creationDate: D,
  price: Price,
  /** @dev an orgId */
  buyerId: string,
  /** @dev an orgId */
  sellerId: string,
  paymentSchedule: PaymentScheduleRaw<D>,
  interestRate?: number,
  /** @dev should be one of the buyerId bank accounts */
  account: BankAccount,
  contractId: string,
  /** @dev should be a legal document belonging to contractId */
  legalDocumentId: string,
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
