import { HorizontalState, NodeState, RightState, TitleState, VerticalState, createOrg } from './state';

export function nodeExists(state: TitleState, id: string) {
  return !!getNode(state, id);
}

export function getNode(state: TitleState, id: string): NodeState {
  return state.rights[id] || state.horizontals[id] || state.verticals[id];
}

export function updateNode(state: TitleState, node: NodeState) {
  if (state.rights[node.id]) state.rights[node.id] = node as RightState;
  if (state.verticals[node.id]) state.verticals[node.id] = node as VerticalState;
  if (state.horizontals[node.id]) state.horizontals[node.id] = node as HorizontalState;
}

export function assertNode(state: TitleState, id: string): asserts id {
  if (!nodeExists(state, id)) throw new Error(`Right or group with id "${id}" does not exist.`);
}

function getNodeType(state: TitleState, id: string) {
  if (state.sources[id]) return 'source'; // Source will also be referenced in "rights". Used for categorization
  if (state.rights[id]) return 'right';
  if (state.horizontals[id]) return 'horizontal';
  if (state.verticals[id]) return 'vertical';
}

export function getNodeOrg(state: TitleState, id: string) {
  const node = getNode(state, id);
  const type = getNodeType(state, id);
  switch (type) {
    case 'right':
      return state.orgs[(node as RightState).orgId] ||= createOrg({ id: (node as RightState).orgId });
    case 'horizontal':
      return state.orgs[(node as HorizontalState).blameId] ||= createOrg({ id: (node as HorizontalState).blameId });
    case 'vertical': {
      const { children } = node as VerticalState;
      /** @see createVertical() All childrens of a vertical group have the same orgId .*/
      return getNodeOrg(state, children[0]);
    }
    default:
      throw new Error(`Invalid node type, cannot get orgId for "${id}".`);
  }
}