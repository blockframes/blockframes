import { Action, runAction, createTitleState, History } from '@blockframes/model';
import { structuredClone } from '@blockframes/utils/helpers';

export function waterfall(titleId: string, actions: (Action[] | Action)[]) {
  const state = createTitleState(titleId);
  const history: History[] = [{ ...structuredClone(state), actions: [] }];
  for (const group of actions) {
    if (Array.isArray(group)) {
      for (const action of group) {
        runAction(state, action.name, action.payload);
      }
      history.push({ ...structuredClone(state), actions: group });
    } else {
      runAction(state, group.name, group.payload);
      history.push({ ...structuredClone(state), actions: [group] });
    }
  }

  return { state, history };
}
