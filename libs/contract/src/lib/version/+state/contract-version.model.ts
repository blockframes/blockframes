import { ContractVersionDocumentWithDates, ContractVersionDocument } from "../../contract/+state/contract.firestore";
import { isTimestamp } from "@blockframes/utils/helpers";
import { Contract } from "../../contract/+state/contract.model";

export type ContractVersion = ContractVersionDocumentWithDates;

export type ContractVersionWithTimeStamp = ContractVersionDocument;

/** An interface for a single document to display versions subcollection count. */
export interface VersionMeta extends ContractVersion {
  count?: number;
}

export function createVersionMeta(params: Partial<VersionMeta>): VersionMeta {
  return {
    id: '_meta',
    count: params.count || 0,
  } as VersionMeta;
}

/**
 *
 * @param contractVersion
 */
export function formatContractVersion(contractVersion: any): ContractVersion {
  // Dates from firebase are Timestamps, we convert it to Dates.
  if (contractVersion.scope && isTimestamp(contractVersion.scope)) {
    contractVersion.scope.start = contractVersion.scope.start.toDate();
  }

  if (contractVersion.scope && isTimestamp(contractVersion.scope)) {
    contractVersion.scope.end = contractVersion.scope.end.toDate();
  }

  if (contractVersion.creationDate && isTimestamp(contractVersion.creationDate)) {
    contractVersion.creationDate = contractVersion.creationDate.toDate();
  }

  return contractVersion as ContractVersion;
}

/**
 * Returns the creation date of the contract.
 * @param contract
 */
export function getContractInitialCreationDate(contract: Contract): Date {
  const firstContract = contract.versions.find(version => version.id === '1');
  return firstContract.creationDate;
}
