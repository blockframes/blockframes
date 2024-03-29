import { DocumentMeta, createDocumentMeta } from '../meta';
import { Action, createAction } from './action';

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

export function buildBlock(name: string, actions: Partial<Action>[], date: Date, createdBy: string) {
  const block = createBlock({
    _meta: createDocumentMeta({ createdBy }),
    timestamp: date.getTime(),
    name
  });
  let index = 0;
  for (const action of actions) {
    block.actions[index] = createAction({
      ...action,
      actionId: index.toString() // overwrite previous id generated by action() in libs/model/src/lib/waterfall/action.ts
    });
    index++;
  }
  return block;
}