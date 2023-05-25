import { DocumentMeta } from '../meta';
import { Action } from './action';

export interface Block {
  _meta?: DocumentMeta;
  id: string;
  timestamp: number;
  name: string;
  actions: Record<number, Action>
}

export function createBlock(params: Partial<Block> = {}): Block {
  return {
    id: '',
    name: '',
    actions: {},
    timestamp: new Date().getTime(),
    ...params,
  }
}