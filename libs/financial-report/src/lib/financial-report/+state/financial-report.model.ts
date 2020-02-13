import { FinancialReport, FinancialReportVersion, FinancialReportTitleDetail, SendType, ReportStatus, Taxes } from "./financial-report.firestore";
import { createRange } from "@blockframes/utils/common-interfaces/range";

export function createTaxes(params: Partial<Taxes> = {}): Taxes {
  return {
    CNCContribution: {
      percentage: 0,
    },
    ...params
  };
}

export function createFinancialReport(params: Partial<FinancialReport> = {}): FinancialReport {
  return {
    id: '',
    titles: {},
    contractId: '',
    senderId: '',
    reportFrequency: [],
    choosenCurrency: 'EUR',
    recipientId: '',
    totalContractGrossReceipts: 0,
    totalPaidGrossReceipts: 0,
    totalNetReceipts: 0,
    reportingTerm: params.reportingTerm,
    ...params,
    scope: createRange(params.scope),
  };
}

export function createFinancialReportVersion(params: Partial<FinancialReportVersion> = {}): FinancialReportVersion {
  return {
    id: '',
    contractVersionCount: 0,
    titles: {},
    sendDate: new Date(),
    sendType: [],
    status: ReportStatus.waiting,
    contractGrossReceipts: 0,
    paidGrossReceipts: 0,
    netReceipts: 0,
    expenses: 0,
    sumTaxes: 0,
    recipientShare: 0,
    invoicedAmount: 0,
    ...params,
    taxes: createTaxes(params.taxes),
  };
}

export function createFinancialReportTitleDetail(params: Partial<FinancialReportTitleDetail> = {}): FinancialReportTitleDetail {
  return {
    titleId: '',
    expenses: [],
    sumExpenses: 0,
    sumCollectedExpenses: 0,
    percentageMarketExpenses: 0,
    ...params
  };
}