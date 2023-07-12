import { DocumentMeta } from '../meta';
import { ActionName } from './action';

export interface Right {
  _meta?: DocumentMeta;
  id: string;
  actionName: ActionName;
  groupId: string;
  groupPercent: number;
  previousId: string;
  rightholderId: string;
  percent: number;
}

export function createRight(params: Partial<Right> = {}): Right {
  return {
    id: '',
    actionName: 'append',
    groupId: '',
    groupPercent: 1,
    previousId: '',
    rightholderId: '',
    percent: 1,
    ...params
  }
}