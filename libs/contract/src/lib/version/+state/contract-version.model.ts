import { ContractVersionDocumentWithDates, ContractVersionDocument } from "../../contract/+state/contract.firestore";
import { toDate } from "@blockframes/utils/helpers";

export type ContractVersion = ContractVersionDocumentWithDates;

export type ContractVersionWithTimeStamp = ContractVersionDocument;

/**
 * Format version dates from Timestamps into Dates.
 * @param contractVersion
 */
export function createContractVersionFromFirestore(contractVersion: any): ContractVersion {
  // Dates from firebase are Timestamps, we convert it to Dates.
  if (contractVersion.scope && contractVersion.scope.start) {
    contractVersion.scope.start = toDate(contractVersion.scope.start);
  }

  if (contractVersion.scope && contractVersion.scope.end) {
    contractVersion.scope.end = toDate(contractVersion.scope.end);
  }

  if (contractVersion.creationDate) {
    contractVersion.creationDate = toDate(contractVersion.creationDate);
  }

  return contractVersion as ContractVersion;
}

/** Cleans an organization of its optional parameters */
export function cleanContractVersion(version: ContractVersion) {
  const v = { ...version };
  // Remove local values in any
  return v;
}
