import { firestore } from "firebase";
import { Expense } from "@blockframes/utils/common-interfaces/price";
import { RawRange } from '@blockframes/utils/common-interfaces/range';
import { MovieCurrenciesSlug } from "@blockframes/utils/static-model/types";
import { ScheduledDateWithCounterRaw } from "@blockframes/utils/common-interfaces/terms";

type Timestamp = firestore.Timestamp;

export const enum SendType {
  email = 'Email',
  mail = 'Mail',
  fax = 'Fax',
  web = 'Web',
}

export const enum ReportStatus {
  waiting = 'Waiting',
  sent = 'Sent',
  errored = 'Errored',
}

/*
--- WIP ---
totalGrossReicepts: Price // cumul a date


--- VERSION ---
grossReicepts: Price // cumul a date de la version
paidGrossReceipts: Price
commission: number
netReceipts: Price (= paidGrossReceipts - commission* paidGrossReceipts)
Tax: number
LicensorShare: Price
paidLicensorShare: Price
amountToInvoice: Price
*/



/**
 * Subcollection of a financial report document.
 * @dev Allows to handle multiple number of a financial report
 */
interface FinancialReportVersionRaw<D> {
  id: string;
  /**
   * If empty, the report have not been sent yet
   */
  sendDate?: D;
  sendType: SendType[];
  status: ReportStatus;
  /**
   * @dev the location where the report should be sent to if sendType = 'mail' | 'fax'
   * one of the locations of the FinancialReportTitleDetail.recipientId
   */
  location?: Location;
  /**
   * @dev the email address where the report should be sent to if sentType = 'email',
   */
  email?: string;
}

interface FinancialReportRaw<D> {
  id: string;
  scope: RawRange<D>;
  titles: Record<string, FinancialReportTitleDetail>;
  contractId: string;
  /**
   * @dev orgId of the sender
   */
  senderId: string;
  /**
   * @dev this represents the frequency of financial report sending (mail or email)
   * This data is stored here so we can have different frequencies & currencies
   * for each recipient of a financialReport.
   * 
   */
  reportFrequency: ScheduledDateWithCounterRaw<D>[];
  choosenCurrency: MovieCurrenciesSlug;
  /**
   * @dev this is an OrgId that belongs to a party of FinancialReport.contractId
   * This org will receive the report.
   * Given that a FinancialReportRaw is linked only one recipient,
   * There will be as much as FinancialReport documents as we have recipients for 
   * a report.
   */
  recipientId: string;
}

export interface FinancialReportTitleDetail {
  titleId: string,
  /**
   * @dev this contains the various expenses that apply to this this FinancialReportTitleDetail
   */
  expenses: Expense[],
  /**
   * @dev this is the sum of the expected expenses (price) (expenses: Expense[]).
   * Details: 
   * (sum Expense[] where type = 'market' * percentageMarketExpenses) 
   * + 
   * (sum Expense[] where type = 'export')
   */
  sumExpenses: number,
  /**
   * @dev this represents the collected expenses (collected) from expenses: Expense[]
   */
  sumCollectedExpenses: number,
  percentageMarketExpenses: number,

}

export interface FinancialReport extends FinancialReportRaw<Date> {
}

export interface FinancialReportDocument extends FinancialReportRaw<Timestamp> {
}

export interface FinancialReportVersion extends FinancialReportVersionRaw<Date> {
}

export interface FinancialReportVersionDocument extends FinancialReportVersionRaw<Timestamp> {
}