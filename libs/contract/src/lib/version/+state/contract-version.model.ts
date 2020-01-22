import { firestore } from "firebase/app";
import { ContractVersionDocumentWithDates, ContractVersionDocument } from "../../contract/+state/contract.firestore";

export type ContractVersion = ContractVersionDocumentWithDates;

export type ContractVersionWithTimeStamp = ContractVersionDocument;

/** An interface for a single document to display versions subcollection count. */
export interface VersionMeta extends ContractVersion {
  count?: number;
}

export function createVersionMeta(params: Partial<VersionMeta>): VersionMeta {
  return {
    id: '_meta',
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

  if (contractVersion.scope && contractVersion.scope.end instanceof firestore.Timestamp) {
    contractVersion.scope.end = contractVersion.scope.end.toDate();
  }

  if (contractVersion.creationDate && contractVersion.creationDate instanceof firestore.Timestamp) {
    contractVersion.creationDate = contractVersion.creationDate.toDate();
  }

  return contractVersion as ContractVersion;
}
