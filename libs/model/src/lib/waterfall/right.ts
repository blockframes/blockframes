import { DocumentMeta } from '../meta';
import { ActionName } from './action';
import { ConditionGroup } from './conditions';

export interface Right {
  _meta?: DocumentMeta;
  id: string;
  name: string;
  date: Date;
  actionName: ActionName;
  groupId: string;
  previousIds: string[];
  nextIds: string[];
  rightholderId: string;
  percent: number;
  conditions?: ConditionGroup;
  blameId?: string;
  pools: string[];
  order: number;
}

export function createRight(params: Partial<Right> = {}) {
  const right: Right = {
    id: '',
    name: '',
    date: new Date(),
    actionName: 'append',
    groupId: '',
    previousIds: [],
    nextIds: [],
    rightholderId: '',
    percent: 100,
    pools: [],
    order: 0,
    ...params
  }

  if (!right.name) right.name = right.id;

  return right;
}