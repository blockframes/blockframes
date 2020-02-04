import { ContractVersionDocumentWithDates, ContractVersionDocument } from "../../contract/+state/contract.firestore";
import { toDate } from "@blockframes/utils/helpers";
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
    count: params && params.count ? params.count : 0,
  } as VersionMeta;
}

/**
 *  Format version dates from Timestamps into Dates.
 * @param contractVersion
 */
export function formatContractVersion(contractVersion: any): ContractVersion {
  // Dates from firebase are Timestamps, we convert it to Dates.
  if (contractVersion.scope) {
    contractVersion.scope.start = toDate(contractVersion.scope.start);
  }

  if (contractVersion.scope) {
    contractVersion.scope.end = toDate(contractVersion.scope.end);
  }

  contractVersion.creationDate = toDate(contractVersion.creationDate);

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

/**
 * Returns the last version of a contract.
 * @param contract
 */
export function getContractLastVersion(contract: Contract): ContractVersion {
  const { count }: VersionMeta = contract.versions.find(v => v.id === '_meta')
  const index = contract.versions.map(v => v.id).indexOf(count.toString())
  return contract.versions[index];
}
