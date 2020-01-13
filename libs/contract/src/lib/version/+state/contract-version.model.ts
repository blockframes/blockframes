import { createTerms } from "@blockframes/utils/common-interfaces/terms";
import { createPrice } from "@blockframes/utils/common-interfaces/price";
import { createContract, Contract } from "../../+state/contract.model";
import { ContractVersionDocumentWithDates, ContractStatus } from "../../+state/contract.firestore";

export type ContractVersion = ContractVersionDocumentWithDates;

/**
 * @dev this should not be saved to firestore,
 * used only in front
 */
export interface ContractWithLastVersion {
  doc: Contract,
  last: ContractVersion,
}

export function createContractVersion(params: Partial<ContractVersion> = {}): ContractVersion {
  return {
    id: params.id ? params.id : '1',
    titles: {},
    creationDate: new Date(),
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
