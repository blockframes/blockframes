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
  percent: number; // Between 0 and 100
  conditions?: ConditionGroup;
  version: Record<string, RightVersion>;
  blameId?: string;
  pools: string[];
}

export interface RightVersion {
  standalone?: true;
  percent?: number;
  conditions?: ConditionGroup;
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

export function skipGroups(rights: Right[]) {
  // Groups are skipped here and revenue will be re-calculated from the childrens
  const groupRightTypes: RightType[] = ['horizontal', 'vertical'];
  return rights.filter(r => !groupRightTypes.includes(r.type));
}

/**
 * Get childs of a right (excluding groups but with groups childs)
 * @param rightId
 * @param rights 
 */
export function getChilds(rightId: string, rights: Right[]): Right[] {
  const _childs = [..._getChilds(rightId, rights), rights.find(r => r.id === rightId)];
  const childs: Right[] = [];
  for (const child of _childs) {
    if (isGroup(child)) {
      const subChilds = rights.filter(r => r.groupId === child.id);
      for (const schild of subChilds) {
        if (isGroup(schild)) {
          childs.push(...rights.filter(r => r.groupId === schild.id));
        } else {
          childs.push(schild);
        }
      }
    } else {
      childs.push(child);
    }
  }

  const uniqueChilds = Array.from(new Set(childs.map(c => c.id))).map(id => childs.find(c => c.id === id));
  return uniqueChilds.filter(c => !!c)
}

function isGroup(right: Right): boolean {
  return ['horizontal', 'vertical'].includes(right.type);
}

function _getChilds(rightId: string, rights: Right[]): Right[] {
  const childs = rights.filter(r => r.nextIds.includes(rightId));
  if (!childs.length) return [];
  return childs.concat(childs.map(c => getChilds(c.id, rights)).flat());
}
