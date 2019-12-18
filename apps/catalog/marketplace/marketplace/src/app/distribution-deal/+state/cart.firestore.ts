import { firestore } from "firebase/app";
import { TermsRaw } from "@blockframes/utils/common-interfaces/terms";
import { Party } from "@blockframes/utils/common-interfaces/identity";
import { Price } from "@blockframes/utils/common-interfaces/price";

type Timestamp = firestore.Timestamp;

export const enum ContractStatus {
  submitted = 'submitted',
  accepted = 'accepted',
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

interface ContractRaw<D> {
  id: string,
  parentContractIds?: string[],
  childContractIds?: string[],
  parties: Party[],
  status: ContractStatus,
  scope: TermsRaw<D>,
  signDate?: D,
  titles: Record<string, ContractTitleDetail>,
  price: Price;
  paymentSchedule?: string; // @todo #1397 change this when creating invoices
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
