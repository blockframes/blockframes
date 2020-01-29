import { FinancialReportVersion } from "../../financial-report/+state/financial-report.firestore";


/** An interface for a single document to display versions subcollection count. */
export interface VersionMeta extends FinancialReportVersion {
  count?: number;
}

export function createVersionMeta(params: Partial<VersionMeta>): VersionMeta {
  return {
    id: '_meta',
    count: params && params.count || 0,
  } as VersionMeta;
}