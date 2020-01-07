import { createTerms } from "@blockframes/utils/common-interfaces/terms";
import { createPrice } from "@blockframes/utils/common-interfaces/price";
import { getCodeIfExists } from "@blockframes/movie/static-model/staticModels";
import { ContractDocumentWithDates, ContractStatus, ContractTitleDetail } from "./contract.firestore";

export type Contract = ContractDocumentWithDates;

export function createContract(params: Partial<Contract> = {}): Contract {
  return {
    id: params.id ? params.id : '',
    parties: [],
    titles: {},
    ...params,
    status: ContractStatus.submitted,
    scope: createTerms(params.scope),
    price: createPrice(params.price),
  };
}

export function createContractTitleDetail(params: Partial<ContractTitleDetail> = {}): ContractTitleDetail {
  return {
    titleId: '',
    distributionDealIds: [],
    ...params,
    price: createPrice(params.price),
  };
}

/**
 * Various validation steps for validating a contract
 * Currently (dec 2019), only validate that there is licensee and a licensor
 * @param contract
 */
export function validateContract(contract: Contract): boolean {

  // First, contract must have at least a licensee and a licensor

  if (contract.parties.length < 2) { return false; }
  const licensees = contract.parties.filter(p => p.role === getCodeIfExists('LEGAL_ROLES', 'licensee'))
  const licensors = contract.parties.filter(p => p.role === getCodeIfExists('LEGAL_ROLES', 'licensor'))

  if (!licensees.length || !licensors.length) { return false; }

  for(const licensee of licensees) {
    if(licensee.orgId === undefined) {
      delete licensee.orgId
    }
    if(typeof licensee.showName !== 'boolean') {
      return false;
    }
  }

  for(const licensor of licensors) {
    if(licensor.orgId === undefined) {
      delete licensor.orgId
    }
    if(typeof licensor.showName !== 'boolean') {
      return false;
    }
  }

  // Other contract validation steps goes here
  // ...

  return true;
}
