import { Action, runAction, createTitleState, History, Block } from '@blockframes/model';
import { structuredClone } from '@blockframes/utils/helpers';

export function waterfall(titleId: string, actions: (Action[] | Action | Block)[]) {
  const state = createTitleState(titleId);
  const history: History[] = [{ ...structuredClone(state), actions: [], name: 'Init' }];

  const isBlock = (action: Action | Block): action is Block => 'actions' in action;

  for (const group of actions) {
    if (Array.isArray(group)) {
      for (const action of group) {
        runAction(state, action.name, action.payload);
      }
      history.push({ ...structuredClone(state), actions: group, name: `${group.length} actions` });
    } else if (isBlock(group)) {
      const actions = Object.values(group.actions);
      for (const action of actions) {
        runAction(state, action.name, action.payload);
      }
      history.push({ ...structuredClone(state), actions, name: group.name });
    } else {
      runAction(state, group.name, group.payload);
      history.push({ ...structuredClone(state), actions: [group], name: group.name });
    }
  }

  return { state, history };
}
