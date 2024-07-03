import { DocumentMeta } from '../meta';
import { RightType } from '../static/types';
import { ActionName } from './action';
import { Condition, ConditionGroup, ConditionWithTarget, isCondition, isConditionWithTarget } from './conditions';
import { Statement } from './statement';
import { Waterfall } from './waterfall';

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
  const right = rights.find(r => r.id === rightId);
  if (!right) return [];
  const _childs = [..._getChilds(rightId, rights), right];
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

/**
 * Get rights to display on graph for a rightholder that is not admin:
 * Includes all rights that belongs to the rightholder and their parents includind group childs.
 * Does not include root rights of a an horizontal group that does not belong to the rightholder.
 * @param rightholderId 
 * @param _rights 
 * @returns 
 */
export function getRightsToDisplay(rightholderId: string, _rights: Right[]): Right[] {
  const rights = _rights.filter(r => r.rightholderId === rightholderId);
  const rightsToDisplay: Right[] = [];
  for (const right of rights) {
    const parents = getParents(right.id, _rights);
    if (right.groupId) {
      const group = _rights.find(r => r.id === right.groupId);
      parents.push(group);
      const childs = _rights.filter(r => r.groupId === group.id && r.rightholderId === right.rightholderId);
      parents.push(...childs);

      if (group.groupId) {
        const subGroup = _rights.find(r => r.id === group.groupId);
        parents.push(subGroup);
        const subChilds = _rights.filter(r => r.groupId === subGroup.id && r.rightholderId === right.rightholderId);
        parents.push(...subChilds);
      }
    } else {
      rightsToDisplay.push(right);
    }

    for (const parent of parents) {
      if (!rightsToDisplay.find(r => r.id === parent.id)) {
        rightsToDisplay.push(parent);
      }
    }
  }

  return rightsToDisplay;
}

function getParents(rightId: string, rights: Right[]): Right[] {
  const right = rights.find(r => r.id === rightId);
  if (!right) return [];
  let parents: Right[] = [];
  if (right.groupId) {
    const group = rights.find(r => r.id === right.groupId);
    if (group.groupId) {
      const subGroup = rights.find(r => r.id === group.groupId);
      parents = _getParents(subGroup, rights);
    } else {
      parents = _getParents(group, rights);
    }
  } else {
    parents = _getParents(right, rights);
  }

  const parentIds = Array.from(new Set(parents.map(p => p.id)));
  return parentIds.map(id => parents.find(p => p.id === id));
}

function _getParents(right: Right, rights: Right[]): Right[] {
  if (!right) return [];
  const parents = right.nextIds.map(id => rights.find(r => r.id === id));
  if (!parents.length) return [];
  const parentGroups = parents.filter(p => isGroup(p));
  for (const group of parentGroups) {
    const childs = rights.filter(r => r.groupId === group.id);
    parents.push(...childs);
    const subGroups = childs.filter(c => isGroup(c));
    for (const subGroup of subGroups) {
      parents.push(...rights.filter(r => r.groupId === subGroup.id));
    }
  }
  return parents.concat(parents.map(p => _getParents(p, rights)).flat());
}

function isGroup(right?: Right): boolean {
  if (!right) return false;
  return ['horizontal', 'vertical'].includes(right.type);
}

function _getChilds(rightId: string, rights: Right[]): Right[] {
  if (!rightId) return [];
  const childs = rights.filter(r => r.nextIds.includes(rightId));
  if (!childs.length) return [];
  return childs.concat(childs.map(c => getChilds(c.id, rights)).flat());
}

/**
 * Return expense types defined in conditions of a right
 * @param right 
 * @param statement
 * @param waterfall
 * @returns 
 */
export function getRightExpenseTypes(right: Right, statement?: Statement, waterfall?: Waterfall) {
  const conditions = getRightCondition(right);
  const conditionsWithTarget = conditions.filter(c => isConditionWithTarget(c)) as ConditionWithTarget[];

  const expenseTargets = conditionsWithTarget
    .map(c => (typeof c.payload.target === 'object' && c.payload.target.in === 'expense') ? c.payload.target.id : undefined)
    .filter(id => !!id);

  /** 
  * @deprecated not used. Might be removed in future
  * If target "orgs.expense" in "targetIn" libs/model/src/lib/waterfall/conditions.ts is re-enabled, uncomment this code
  const [orgId] = conditionsWithTarget
    .map(c => (typeof c.payload.target === 'object' && c.payload.target.in === 'orgs.expense') ? c.payload.target.id : undefined)
    .filter(id => !!id);

  if (orgId) {
    // @dev target contract.expense instead of org.expense would be more appropriate.
    if (orgId !== statement.senderId) throw new Error(`Statement senderId ${statement.senderId} does not match expense target orgId ${orgId}`);
    const orgExpenseTargets = waterfall.expenseTypes[statement.contractId || 'directSales'].map(e => e.id);
    expenseTargets.push(...orgExpenseTargets);
  }*/

  return Array.from(expenseTargets);
}

export function getRightsExpenseTypes(rights: Right[]) {
  return rights.map(r => getRightExpenseTypes(r)).flat();
}