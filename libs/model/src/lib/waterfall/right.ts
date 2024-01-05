import { DocumentMeta } from '../meta';
import { RightType } from '../static/types';
import { ActionName } from './action';
import { Condition, ConditionGroup, isCondition } from './conditions';

export interface Right {
  _meta?: DocumentMeta;
  id: string;
  type: RightType,
  name: string;
  contractId?: string;
  actionName: ActionName;
  groupId: string;
  order: number; // Used for vertical group childs
  /** Parents (above) of this right */
  nextIds: string[];
  rightholderId: string;
  percent: number;
  conditions?: ConditionGroup;
  version: Record<string, RightVersion>;
  blameId?: string;
  pools: string[];
}

export interface RightVersion {
  deleted?: true;
  percent?: number;
  conditions?: ConditionGroup;
  nextIds?: string[];
  pools?: string[];
  groupId?: string;
}

export interface RightOverride {
  incomeId: string;
  rightId: string;
  percent: number;
  initial: number;
  comment: string;
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
    version: {},
    ...params
  }

  if (!right.name) right.name = right.id;

  return right;
}

export function createRightOverride(params: Partial<RightOverride> = {}): RightOverride {
  return {
    incomeId: '',
    rightId: '',
    percent: 100,
    initial: 100,
    comment: '',
    ...params
  }
}

/**
 * Order rights by their nextIds.
 * For waterfall rights creation, we need them ordered (prepend)
 * @param rights 
 * @returns 
 */
export function orderRights(rights: Right[]): Right[] {
  const allNextIds = Array.from(new Set(rights.map(right => right.nextIds).flat()));
  const notMatching = allNextIds.filter(id => !rights.map(right => right.id).includes(id))
  if (notMatching.length) throw new Error(`Some nextIds do not match any right id : ${notMatching}`);

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

export function getRightCondition(right: Right) {
  return (right.conditions?.conditions?.filter(c => isCondition(c)).filter(c => !!c) || []) as Condition[];
}