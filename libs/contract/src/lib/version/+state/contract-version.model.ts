import { ContractVersionDocumentWithDates, ContractVersionDocument } from "../../contract/+state/contract.firestore";
import { toDate } from "@blockframes/utils/helpers";
import { createTerms } from "@blockframes/utils/common-interfaces/terms";
import { createPrice } from "@blockframes/utils/common-interfaces/price";

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

export function createContractVersion(params: Partial<ContractVersion> = {}): ContractVersion {
  return {
    id: params.id || 1,
    titles: {},
    creationDate: new Date(),
    paymentSchedule: [],
    status: 'draft',
    ...params,
    paymentTerm: createTerms(params.paymentTerm),
    scope: createTerms(params.scope),
    price: createPrice(params.price)
  };
}

/** Cleans an contract version of its optional parameters */
export function cleanContractVersion(version: ContractVersion) {
  const v = { ...version };
  // Remove local values in any
  return v;
}
