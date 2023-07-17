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
  groupPercent: number;
  previousIds: string[];
  rightholderId: string;
  percent: number;
  conditions?: ConditionGroup;
}

export function createRight(params: Partial<Right> = {}) {
  const right: Right = {
    id: '',
    name: '',
    date: new Date(),
    actionName: 'append',
    groupId: '',
    groupPercent: 1,
    previousIds: [],
    rightholderId: '',
    percent: 1,
    ...params
  }

  if (!right.name) right.name = right.id;

  return right;
}