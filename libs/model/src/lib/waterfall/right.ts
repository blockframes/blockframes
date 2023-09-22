import { DocumentMeta } from '../meta';
import { RightType } from '../static/types';
import { ActionName } from './action';
import { ConditionGroup } from './conditions';

export interface Right {
  _meta?: DocumentMeta;
  id: string;
  type: RightType,
  name: string;
  date: Date;
  contractId?: string;
  actionName: ActionName;
  groupId: string;
  previousIds: string[];
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
    date: new Date(),
    actionName: 'append',
    groupId: '',
    previousIds: [],
    nextIds: [],
    rightholderId: '',
    percent: 100,
    pools: [],
    ...params
  }

  if (!right.name) right.name = right.id;

  return right;
}