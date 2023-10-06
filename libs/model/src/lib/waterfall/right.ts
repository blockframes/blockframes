import { DocumentMeta } from '../meta';
import { RightType } from '../static/types';
import { ActionName } from './action';
import { ConditionGroup } from './conditions';
import { WaterfallContract } from './waterfall';

export interface Right {
  _meta?: DocumentMeta;
  id: string;
  type: RightType,
  name: string;
  contractId?: string;
  actionName: ActionName;
  groupId: string;
  order: number; // Used for vertical group childs
  nextIds: string[];
  rightholderId: string;
  percent: number;
  conditions?: ConditionGroup;
  blameId?: string;
  pools: string[];
}

export function createRight(params: Partial<Right> = {}) {
  const right: Right = {
    id: '',
    type: 'unknown',
    name: '',
    actionName: 'prepend',
    groupId: '',
    order: 0,
    nextIds: [],
    rightholderId: '',
    percent: 100,
    pools: [],
    ...params
  }

  if (!right.name) right.name = right.id;

  return right;
}

/**
 * Order rights by their nextIds.
 * For waterfall rights creation, we need them ordered (prepend)
 * @param rights 
 * @returns 
 */
export function orderRights(rights: Right[]): Right[] {
  const allNextIds = Array.from(new Set(rights.map(right => right.nextIds).flat()));
  if (allNextIds.some(id => !rights.map(right => right.id).includes(id))) throw new Error('Some nextIds do not match any right id');

  const rootRights = rights.filter(right => !right.nextIds.length);
  let childRights = rights.filter(right => right.nextIds.length);
  const orderedRights = rootRights;

  while (childRights.length > 0) {
    const nextRights = childRights.filter(r => r.nextIds.every(nextId => orderedRights.map(i => i.id).includes(nextId)));
    childRights = childRights.filter(r => !nextRights.includes(r));
    orderedRights.push(...nextRights);
  }

  return orderedRights;
}

export function getRightsOf(allRights: Right[], contract: WaterfallContract, ){
  // TODO #9493 rights should be filtered by right.contractId to limit displayed rights (a rightholder can have multiple contracts)
  // Temporary solution to try to limit good rights to fetch for contract
  const rightsOfContract = allRights.filter(r => r.contractId === contract.id);
  const rightsWithoutContract = allRights.filter(r => !r.contractId && [contract.buyerId, contract.sellerId].includes(r.rightholderId));
  return [...rightsOfContract,...rightsWithoutContract];
}