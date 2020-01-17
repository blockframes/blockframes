import { createTerms } from "@blockframes/utils/common-interfaces/terms";
import { createPrice } from "@blockframes/utils/common-interfaces/price";
import { createContract, Contract } from "../../+state/contract.model";
import { ContractVersionDocumentWithDates, ContractStatus } from "../../+state/contract.firestore";
import { firestore } from "firebase/app";

export type ContractVersion = ContractVersionDocumentWithDates;

/**
 * @dev this should not be saved to firestore,
 * used only in front
 */
export interface ContractWithLastVersion {
  doc: Contract,
  last: ContractVersion,
}

/** An interface for a single document to display versions subcollection count. */
export interface VersionMeta extends ContractVersion {
  count: number;
}

export function createVersionMeta(params: Partial<VersionMeta>): VersionMeta {
  return {
    count: params && params.count || 0,
  } as VersionMeta;
}

export function createContractVersion(params: Partial<ContractVersion> = {}): ContractVersion {
  return {
    id: params.id ? params.id : '1',
    titles: {},
    creationDate: new Date(),
    paymentSchedule: [],
    ...params,
    status: ContractStatus.submitted,
    scope: createTerms(params.scope),
    price: createPrice(params.price),
  };
}

export function initContractWithVersion(): ContractWithLastVersion {
  return {
    doc: createContract(),
    last: createContractVersion(),
  }
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
