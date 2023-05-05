import { 
  Action,
  runAction,
  createTitleState,
  NodeState,
  VerticalState,
  HorizontalState,
  OrgState,
  RightState,
  History,
  TransferState
} from '@blockframes/model';
import { structuredClone } from '@blockframes/utils/helpers';

export function waterfall(titleId: string, actions: (Action[] | Action)[], scope: string[] = []) {
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

  return { state, history: history.map(h => filterHistory(h, scope)) };
}

function filterHistory(history: History, scope: string[] = []) {
  if (scope.length) {
    const rightState = Object.values(history.rights);
    const groupState = Object.values(history.horizontals);

    // Fetch only rights that belong to scope
    const orgRights = rightState.filter(o => scope.includes(o.orgId));
    const orgGroups = groupState.filter(o => o.children.some(child => !!orgRights.find(r => r.id === child)));

    const parentRights = (right: NodeState) => {
      const parentsRights: RightState[] = rightState.filter(r => r.previous.includes(right.id));
      const parentsGroups: HorizontalState[] = groupState.filter(r => r.previous.includes(right.id));

      for (const parent of parentsRights) {
        orgRights.push(parent);
        parentRights(parent);
      }

      for (const parent of parentsGroups) {
        orgGroups.push(parent);
        parentRights(parent);
        // @bruce: children can now be horizontal/vertical group too. How to change this ?
        const rights = parent.children.map(rightId => rightState.find(right => right.id === rightId) as RightState);
        for (const right of rights) {
          orgRights.push(right);
          parentRights(right);
        }
      }
    };

    for (const right of orgRights) {
      parentRights(right);
    }

    for (const group of orgGroups) {
      parentRights(group);
      // @bruce: children can now be horizontal/vertical group too. How to change this ?
      const rights = group.children.map(rightId => rightState.find(right => right.id === rightId) as RightState);
      for (const right of rights) {
        orgRights.push(right);
        parentRights(right);
      }
    }

    // Keep orgs related to fetched rights
    const orgsState = Object.values(history.orgs).filter(o => orgRights.map(r => r.orgId).includes(o.id));

    // Keep transfers retated to fetched rights
    const orgsTransfers = Object.values(history.transfers).filter(t => orgRights.find(r => r.id === t.from) || orgRights.find(r => r.id === t.to));

    history.rights = orgRights.reduce((map: Record<string, RightState>, right) => (map[right.id] = right, map), {});
    history.horizontals = orgGroups.reduce((map: Record<string, HorizontalState>, right) => (map[right.id] = right, map), {});
    history.verticals = orgGroups.reduce((map: Record<string, VerticalState>, right) => (map[right.id] = right, map), {});
    history.orgs = orgsState.reduce((map: Record<string, OrgState>, org) => (map[org.id] = org, map), {});
    history.transfers = orgsTransfers.reduce((map: Record<string, TransferState>, t) => (map[`${t.from}->${t.to}`] = t, map), {});
  }
  return history;
}
