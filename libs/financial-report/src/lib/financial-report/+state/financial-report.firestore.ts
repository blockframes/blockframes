import { firestore } from "firebase";
import { Expense, Price } from "@blockframes/utils/common-interfaces/price";
import { RawRange } from '@blockframes/utils/common-interfaces/range';
import { MovieCurrenciesSlug } from "@blockframes/utils/static-model/types";
import { ScheduledDateWithCounterRaw } from "@blockframes/utils/common-interfaces/terms";
import { Location } from "@blockframes/utils/common-interfaces/utility";

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

export interface Taxes {
  CNCContribution: {
    percentage: number;
    input?: string;
  };
  OtherTax?: {
    percentage: number;
    input?: string;
  };
}

/**
 * Subcollection of a financial report document.
 * @dev Allows to handle multiple number of a financial report
 */
interface FinancialReportVersionRaw<D> {
  id: string;
  /**
   * @dev In the FinancialReport interface we have contractId
   * Here he put the contractVersion number of the contractId we used to
   * create the current FinancialReport Version
   */
  contractVersionCount: number
  /**
   * @dev This is the same structure that we have for contractId
   * But this represent the state for the current FinancialReport version date.
   */
  titles: Record<string, FinancialReportTitleDetail>;
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
  /**
   * @dev This represents the sum of contract.Price and all his childrens at a given date
   */
  contractGrossReceipts: number;
  /**
   * @dev This represents the sum of contract.collected and all his childrens at a given date
   */
  paidGrossReceipts: number;
  /**
   * @dev This represents the net receipts at a given date
   *  netReceipts is calculated as follow:
   *    netReceipts = paidGrossReceipts ( contractId.price.commission - paidGrossReceipts )
   */
  netReceipts: number;
  /**
   * @dev Expenses are calculated as follow:
   *  sumExpenses = sum of (titles.FinancialReportTitleDetail.sumExpenses) current version
   *  sumCollectedExpenses = sum of (titles.FinancialReportTitleDetail.sumCollectedExpenses) version N-1
   *  expenses = sumExpenses - sumCollectedExpenses;
   */
  expenses: number;
  /**
   * @dev detail of each taxes that must be applied
   */
  taxes: Taxes;
  /**
   * @dev summ of taxes: {...}
   */
  sumTaxes: number;
  /**
   * @dev This represents the share that recipientId should invoice for.
   * recipentShare is calculated as follow:
   *  if (netReceipts - sumTaxes - expenses >= 0)
   *    recipentShare = netReceipts - sumTaxes - expenses;
   *  else 
   *    recipentShare = 0;
   */
  recipentShare: number;
  /**
   * @dev summ (invoices.price.amount) of invoices that have the contractId referenced 
   * and where contract.titles array-contains { reportId = this report id }
   */
  invoicedAmount: number;
}

interface FinancialReportRaw<D> {
  id: string;
  /**
   * @dev this ref is not mandatory. Will be used to reference this report into invoices
   * This is complementary of id, but more Human (or assimilated) readable
   */
  interalRef?: string;
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
  /**
   * @dev This represents the up-to-date sum of contract.Price and all his childrens
   */
  totalContractGrossReceipts: number;
  /**
   * @dev This represents the up-to-date sum of contract.collected and all his childrens
   */
  totalPaidGrossReceipts: number;

  /**
   * @dev This represents the up-to-date net receipts
   * netReceipts is calculated as follow:
   *  netReceipts = totalPaidGrossReceipts ( contractId.price.commission - totalPaidGrossReceipts )
   */
  totalNetReceipts: number;
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