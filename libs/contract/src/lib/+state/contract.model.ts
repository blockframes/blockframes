import { createPrice } from '@blockframes/utils/common-interfaces/price';
import { getCodeIfExists } from '@blockframes/movie/movie/static-model/staticModels';
import {
  ContractDocumentWithDates,
  ContractStatus,
  ContractTitleDetail,
  ContractPartyDetailDocumentWithDates,
  ContractPartyDetailDocumentWithDatesDocument
} from './contract.firestore';
import { createParty } from '@blockframes/utils/common-interfaces/identity';
import { LegalRolesSlug } from '@blockframes/movie/moviestatic-model/types';

export type Contract = ContractDocumentWithDates;

export type ContractPartyDetail = ContractPartyDetailDocumentWithDates;

export type ContractPartyDetailDocument = ContractPartyDetailDocumentWithDatesDocument;

export function createContract(params: Partial<Contract> = {}): Contract {
  return {
    id: params.id ? params.id : '',
    parties: [],
    titleIds: [],
    partyIds: [],
    ...params
  };
}

export function createContractTitleDetail(
  params: Partial<ContractTitleDetail> = {}
): ContractTitleDetail {
  return {
    titleId: '',
    distributionDealIds: [],
    ...params,
    price: createPrice(params.price)
  };
}

export function createContractPartyDetail(
  params: Partial<ContractPartyDetail> = {}
): ContractPartyDetail {
  return {
    status: ContractStatus.unknown,
    ...params,
    party: createParty(params.party)
  };
}

/**
 * Fetch parties related to a contract given a specific legal role
 * @param contract
 * @param legalRole
 */
export function getContractParties(
  contract: Contract,
  legalRole: LegalRolesSlug
): ContractPartyDetail[] {
  return contract.parties.filter(p => p.party.role === getCodeIfExists('LEGAL_ROLES', legalRole));
}

export function buildChainOfTitle() {
  // ie:  calculate contract prices and fees for each parents
  // @todo #1397 implement this
}
