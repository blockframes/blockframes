import { ContractVersion } from "../../+state/contract.model";
import { firestore } from "firebase/app";



/** An interface for a single document to display versions subcollection count. */
export interface VersionMeta extends ContractVersion {
  count: number;
}

export function createVersionMeta(params: Partial<VersionMeta>): VersionMeta {
  return {
    count: params && params.count || 0,
  } as VersionMeta;
}


/**
 *
 * @param contractVersion
 */
export function formatContractVersion(contractVersion: any): ContractVersion {
  // Dates from firebase are Timestamps, we convert it to Dates.
  if (contractVersion.scope && contractVersion.scope.start instanceof firestore.Timestamp) {
    contractVersion.scope.start = contractVersion.scope.start.toDate();
  }

  if (contractVersion.scope.end instanceof firestore.Timestamp) {
    contractVersion.scope.end = contractVersion.scope.end.toDate();
  }
  return contractVersion as ContractVersion;
}
