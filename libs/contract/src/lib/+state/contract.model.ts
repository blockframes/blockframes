import { createTerms } from '@blockframes/utils/common-interfaces/terms';
import { createPrice } from '@blockframes/utils/common-interfaces/price';
import {
  ContractDocumentWithDates,
  ContractStatus,
  ContractTitleDetail,
  ContractVersionDocumentWithDates,
  ContractPartyDetailDocumentWithDates,
  ContractPartyDetailDocumentWithDatesDocument
} from './contract.firestore';
import { createParty } from '@blockframes/utils/common-interfaces/identity';

export type Contract = ContractDocumentWithDates;

export type ContractVersion = ContractVersionDocumentWithDates;

export type ContractPartyDetail = ContractPartyDetailDocumentWithDates;

export type ContractPartyDetailDocument = ContractPartyDetailDocumentWithDatesDocument;

/**
 * @dev this should not be saved to firestore,
 * used only in front
 */
export interface ContractWithLastVersion {
  doc: Contract;
  last: ContractVersion;
}

export function createContract(params: Partial<Contract> = {}): Contract {
  return {
    id: params.id ? params.id : '',
    parties: [],
    titleIds: [],
    partyIds: [],
    ...params
  };
}

export function createContractVersion(params: Partial<ContractVersion> = {}): ContractVersion {
  return {
    id: params.id ? params.id : '1',
    titles: {},
    creationDate: new Date(),
    ...params,
    status: ContractStatus.submitted,
    scope: createTerms(params.scope),
    price: createPrice(params.price)
  };
}

export function createContractTitleDetail(params: Partial<ContractTitleDetail> = {}): ContractTitleDetail {
  return {
    titleId: '',
    distributionDealIds: [],
    ...params,
    price: createPrice(params.price)
  };
}

export function createContractPartyDetail(params: Partial<ContractPartyDetail> = {}): ContractPartyDetail {
  return {
    status: ContractStatus.unknown,
    ...params,
    party: createParty(params.party)
  };
}

export function initContractWithVersion(): ContractWithLastVersion {
  return {
    doc: createContract(),
    last: createContractVersion()
  };
}

export function buildChainOfTitle() {
  // ie:  calculate contract prices and fees for each parents
  // @todo #1397 implement this
}
