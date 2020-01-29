import { firestore } from "firebase";
import { Fee } from "@blockframes/utils/common-interfaces/price";
import { RawRange } from '@blockframes/utils/common-interfaces/range';
import { MovieCurrenciesSlug } from "@blockframes/utils/static-model/types";

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
  sendType: SendType;
  status: ReportStatus;
  recipientId: string; // @todo #1657 askJackSeed added to know for wich orgId we are sending the report
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
  titles: Record<string, FinancialReportTitleDetail[]>; // @todo #1657 askJackSeed transformed into array
  contractId: string;
  /**
   * @dev orgId of the sender
   */
  senderId: string;
}

export interface FinancialReportTitleDetail {
  titleId: string,
  /**
   * @dev this is an OrgId that belongs to a party of FinancialReport.contractId
   * This org will receive the report
   */
  recipientId: string; // @todo #1657 askJackSeed moved from FinancialReportRaw
  /**
   * @dev this contains the various fees that apply to this this FinancialReportTitleDetail
   */
  fees: Fee[],
  /**
   * @dev this is the sum of the expected fees (price) (fees: Fee[]).
   * Details: 
   * (sum Fees[] where type = 'market' * percentageMarketFees) 
   * + 
   * (sum Fees[] where type = 'export')
   */
  sumFees: number,
  /**
   * @dev this represents the collected fees (collected) from fees: Fee[]
   */
  sumCollectedFees: number,
  percentageMarketFees: number,
  /**
   * @dev this represents the frequency of financial report sending (mail or email)
   * This data is stored here so we can have different frequencies & currencies
   * for each recipient of a financialReport.
   * 
   * 1 = each months, 2 = each two months, 0,5 = twice a month
   */
  reportFrequency: number; // @todo #1657 askJackSeed moved from ContractPartyDetail
  choosenCurrency: MovieCurrenciesSlug; // @todo #1657 askJackSeed moved from ContractPartyDetail
}

export interface FinancialReport extends FinancialReportRaw<Date> {
}

export interface FinancialReportDocument extends FinancialReportRaw<Timestamp> {
}

export interface FinancialReportVersion extends FinancialReportVersionRaw<Date> {
}

export interface FinancialReportVersionDocument extends FinancialReportVersionRaw<Timestamp> {
}