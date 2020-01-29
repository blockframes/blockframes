import { FinancialReport, FinancialReportVersion, FinancialReportTitleDetail, SendType, ReportStatus } from "./financial-report.firestore";
import { createRange } from "@blockframes/utils/common-interfaces/range";

export function createFinancialReport(params: Partial<FinancialReport> = {}): FinancialReport {
  return {
    id: '',
    scope: createRange(params.scope),
    titles: {},
    contractId: '',
    senderId: '',
    ...params
  };
}

export function createFinancialReportVersion(params: Partial<FinancialReportVersion> = {}): FinancialReportVersion {
  return {
    id: '',
    sendType: SendType.email,
    status: ReportStatus.waiting,
    recipientId: '',
    ...params
  };
}

export function createFinancialReportTitleDetail(params: Partial<FinancialReportTitleDetail> = {}): FinancialReportTitleDetail {
  return {
    titleId: '',
    recipientId: '',
    fees: [],
    reportFrequency: 0,
    choosenCurrency: 'euro',
    sumFees: 0,
    sumCollectedFees: 0,
    percentageMarketFees: 0,
    ...params
  };
}