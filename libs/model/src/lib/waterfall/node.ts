import { GroupState, HorizontalState, NodeState, RightState, SourceState, TitleState, VerticalState, createOrg } from './state';

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

export function isSource(state: TitleState, node: Partial<NodeState>): node is SourceState {
  return getNodeType(state, node.id) === 'source';
}

export function isRight(state: TitleState, node: Partial<NodeState>): node is RightState {
  return getNodeType(state, node.id) === 'right';
}

export function isGroup(state: TitleState, node: Partial<NodeState>): node is GroupState {
  return ['horizontal', 'vertical'].includes(getNodeType(state, node.id));
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

/**
 * Returns true if current node id is located inside an horizontal or vertical group
 * @param state 
 * @param id 
 */
export function isGroupChild(state: TitleState, id: string) {
  if (Object.values(state.horizontals).find(g => g.children.includes(id))) return true;
  if (Object.values(state.verticals).find(g => g.children.includes(id))) return true;
  return false;
}

/**
 * Returns the group that a node is child to
 * @param state 
 * @param id 
 */
export function getGroup(state: TitleState, id: string): GroupState {
  if (!isGroupChild(state, id)) return;
  const horizontal = Object.entries(state.horizontals).find(([_, grp]) => grp.children.includes(id));
  if (horizontal) return state.horizontals[horizontal[0]];
  const vertical = Object.entries(state.verticals).find(([_, grp]) => grp.children.includes(id));
  if (vertical) return state.verticals[vertical[0]];
}

/**
 * Returns all deepest rights (excluding sub-groups) of a group
 * @param state 
 * @param group 
 */
export function getChildRights(state: TitleState, group: GroupState): RightState[] {
  const childs = group.children.map(c => getNode(state, c)).filter(c => isRight(state, c)) as RightState[];
  const childGroups = group.children.map(c => getNode(state, c)).filter(c => isGroup(state, c)) as GroupState[];

  if (childGroups.length) {
    const subChilds = childGroups.map(g => getChildRights(state, g)).flat();
    return [...subChilds, ...childs];
  } else {
    return childs;
  }
}

/**
 * Get sources of rights
 * @param state 
 * @param rightIds 
 * @returns source nodes of rights
 */
export function getSources(state: TitleState, rightIds: string | string[], sources: string[] = []) {
  const ids = Array.isArray(rightIds) ? rightIds : [rightIds];
  const tree = getNodesSubTree(state, ids);
  for (const id of ids) {
    const parents = tree.find(n => n.node === id).parents;
    if (parents.length) getSources(state, parents, sources);
    else sources.push(id);
  }

  return sources.filter(s => isSource(state, getNode(state, s))).map(id => getNode(state, id));
}

function getNodesSubTree(state: TitleState, rightIds: string[], tree: { node: string, parents: string[] }[] = []) {
  for (const id of rightIds) {
    if (!isGroupChild(state, id)) {
      const parentNodes = getParentNodes(state, id);
      if (parentNodes.length) getNodesSubTree(state, parentNodes.map(n => n.id), tree);
      const node = getNode(state, id);
      tree.push({ node: node.id, parents: parentNodes.map(n => n.id) });
    } else {
      const group = getGroup(state, id);
      tree.push({ node: id, parents: [group.id] });
      if (!isGroupChild(state, group.id)) {
        const parentNodes = getParentNodes(state, group.id);
        if (parentNodes.length) getNodesSubTree(state, parentNodes.map(n => n.id), tree);
        tree.push({ node: group.id, parents: parentNodes.map(n => n.id) });
      } else {
        const parentGroup = getGroup(state, group.id);
        tree.push({ node: group.id, parents: [parentGroup.id] });
        const parentNodes = getParentNodes(state, parentGroup.id);
        if (!parentNodes.length) throw new Error(`Nested group "${parentGroup.id}" has no parent nodes.`);
        getNodesSubTree(state, parentNodes.map(n => n.id), tree);
        tree.push({ node: parentGroup.id, parents: parentNodes.map(n => n.id) });
      }
    }
  }

  return tree;
}

function getAllValidPaths(from: string, to: string, subTree: { node: string, parents: string[] }[] = []) {
  const paths: string[][] = [];
  const parents = subTree.find(n => n.node === from).parents;
  if (parents.includes(to)) {
    paths.push([from, to]);
  } else {
    for (const parent of parents) {
      const subPaths = getAllValidPaths(parent, to, subTree);
      paths.push(...subPaths.map(p => [from, ...p]));
    }
  }
  return paths;
}

export function getPath(from: string, _to: string, state: TitleState) {
  let to = _to;
  // Is "to" in a group ?
  const grp = getGroup(state, _to);
  if (grp) {
    // Is this group also in a group ? (vertical inside horizontal)
    const parentGroup = getGroup(state, grp.id);
    to = parentGroup ? parentGroup.id : grp.id;
  }
  const subTree = getNodesSubTree(state, [from]);
  const paths = getAllValidPaths(from, to, subTree);
  if (paths.length > 1) throw new Error(`Too many paths between ${from} and ${to}`);
  if (paths.length === 0) throw new Error(`No path between ${from} and ${to}`);
  return paths[0].reverse();
}

export function pathExists(from: string, to: string, state: TitleState) {
  try {
    return !!getPath(from, to, state);
  } catch (_) {
    return false;
  }
}

/**
 * Return parent nodes of a given node
 * @param state 
 * @param id 
 * @returns 
 */
function getParentNodes(state: TitleState, id: string) {
  const sources = Object.values(state.sources).filter(s => s.destinationId === id).map(s => state.rights[s.id]);
  const rights = Object.values(state.rights).filter(r => r.previous.includes(id));
  const horizontals = Object.values(state.horizontals).filter(h => h.previous.includes(id));
  const verticals = Object.values(state.verticals).filter(v => v.previous.includes(id));
  return [...sources, ...rights, ...horizontals, ...verticals];
}