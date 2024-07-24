
import { graphlib, layout } from 'dagre';
import LayoutEngine, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled';

import {
  Media,
  Right,
  RightType,
  Version,
  Territory,
  WaterfallSource,
  createRight as _createRight,
  createWaterfallSource
} from '@blockframes/model';

interface NodeBase {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'source' | 'right' | 'vertical' | 'horizontal';
  children: string[];
  version: Record<string, object>;
  pools: string[];
}

function createNodeBase(params: Partial<NodeBase> = {}): NodeBase {
  return {
    id: '',
    name: '',
    x: 0, y: 0,
    width: 0,
    height: 0,
    type: 'right',
    children: [],
    version: {},
    pools: [],
    ...params
  }
}

export interface SourceNode extends NodeBase {
  type: 'source';
  medias: Media[];
  territories: Territory[];
}

function createSourceNode(params: Partial<SourceNode> = {}): SourceNode {
  const node = createNodeBase(params);
  return {
    ...node,
    type: 'source',
    width: SOURCE_WIDTH,
    height: SOURCE_HEIGHT,
    medias: [],
    territories: [],
    ...params
  }
}

export interface RightNode extends NodeBase {
  type: 'right';
  color: string;
  rightHolderId: string;
  percent: number;
  rightType: RightType;
}

function createRightNode(params: Partial<RightNode> = {}, isHidden = false): RightNode {
  const node = createNodeBase(params);
  return {
    ...node,
    type: 'right',
    width: isHidden ? 0 : RIGHT_WIDTH,
    height: isHidden ? 0 : RIGHT_HEIGHT,
    color: '#000',
    rightHolderId: '',
    percent: 0,
    rightType: 'unknown',
    ...params
  }
}

export interface VerticalNode extends NodeBase {
  type: 'vertical';
  members: RightNode[];
  percent: number;
}

function createVerticalNode(params: Partial<VerticalNode> = {}): VerticalNode {
  const node = createNodeBase(params);
  return {
    ...node,
    type: 'vertical',
    members: [],
    percent: 100,
    ...params
  }
}

export interface HorizontalNode extends NodeBase {
  type: 'horizontal';
  members: (VerticalNode | RightNode)[];
  percent: number;
  blameId: string;
}

function createHorizontalNode(params: Partial<HorizontalNode> = {}): HorizontalNode {
  const node = createNodeBase(params);
  return {
    ...node,
    type: 'horizontal',
    members: [],
    percent: 100,
    blameId: '',
    ...params
  }
}

export type Node = SourceNode | RightNode | VerticalNode | HorizontalNode;

const colors = [
  '#66DF9C',
  '#FFE500',
  '#3A90F3',
  '#FF46CB',
  '#FF0303',
  '#5F0A87',
  '#51D6FF',
  '#351E29',
];

const RIGHT_WIDTH = 240;
const RIGHT_HEIGHT = 180;
const LEVEL_HEIGHT = 112;
const SOURCE_WIDTH = 400;
const SOURCE_HEIGHT = 70;
const SPACING = 32;


export async function toGraph(rights: Right[], sources: WaterfallSource[], hiddenRightHolderIds: string[]) {

  const dedupeOrgs = new Set<string>();
  rights.forEach(right => dedupeOrgs.add(right.rightholderId));
  const orgIds = [...dedupeOrgs].filter(o => !!o).sort();
  const orgColors = orgIds.map((_, i) => colors[i % colors.length]);

  const nodes: Node[] = rights.filter(right => right.groupId === '').map(right => {
    const children = new Set<string>(rights.filter(r => r.nextIds.includes(right.id)).map(r => r.id));

    if (right.type === 'vertical') {
      const members: RightNode[] = rights.filter(r => r.groupId === right.id).sort((a, b) => a.order - b.order).map(vMember => {
        const orgIndex = orgIds.findIndex(id => id === vMember.rightholderId);
        const color = orgColors[orgIndex];
        const rightNode = createRightNode({
          id: vMember.id,
          name: vMember.name,
          color,
          rightHolderId: vMember.rightholderId,
          percent: vMember.percent,
          rightType: vMember.type,
          version: vMember.version,
          pools: vMember.pools,
        }, hiddenRightHolderIds.includes(vMember.rightholderId));
        return rightNode;
      });

      const verticalNode = createVerticalNode({
        id: right.id,
        members: members,
        name: right.name,
        children: [...children],
        height: RIGHT_HEIGHT + (LEVEL_HEIGHT * (members.length - 1)) + (SPACING * (members.length + 1)),
        width: RIGHT_WIDTH + (SPACING * 2),
        version: right.version,
        percent: right.percent,
        pools: right.pools,
      });
      if (members.every(member => member.width === 0 && member.height === 0)) {
        verticalNode.width = 0;
        verticalNode.height = 0;
      }
      return verticalNode;
    } else if (right.type === 'horizontal') {
      const members = rights.filter(r => r.groupId === right.id).map(member => {
        if (member.type === 'vertical') {
          const vMembers = rights.filter(r => r.groupId === member.id).sort((a, b) => a.order - b.order).map(vMember => {
            const orgIndex = orgIds.findIndex(id => id === vMember.rightholderId);
            const color = orgColors[orgIndex];
            const rightNode = createRightNode({
              id: vMember.id,
              name: vMember.name,
              color,
              rightHolderId: vMember.rightholderId,
              percent: vMember.percent,
              rightType: vMember.type,
              version: vMember.version,
              pools: vMember.pools,
            }, hiddenRightHolderIds.includes(vMember.rightholderId));
            return rightNode;
          });
          const verticalNode = createVerticalNode({
            id: member.id,
            name: member.name,
            width: RIGHT_WIDTH + (SPACING * 2), height: RIGHT_HEIGHT + (LEVEL_HEIGHT * (vMembers.length - 1)) + (SPACING * (vMembers.length + 1)),
            members: vMembers,
            version: member.version,
            percent: member.percent,
            pools: member.pools,
          });
          if (vMembers.every(member => member.width === 0 && member.height === 0)) {
            verticalNode.width = 0;
            verticalNode.height = 0;
          }
          return verticalNode;
        } else {
          const orgIndex = orgIds.findIndex(id => id === member.rightholderId);
          const color = orgColors[orgIndex];
          const rightNode = createRightNode({
            id: member.id,
            name: member.name,
            color,
            rightHolderId: member.rightholderId,
            percent: member.percent,
            rightType: member.type,
            version: member.version,
            pools: member.pools,
          }, hiddenRightHolderIds.includes(member.rightholderId));
          return rightNode;
        }
      });
      const maxMemberHeight = Math.max(...members.map(member => member.height));
      const nonHiddenMemberCount = members.filter(member => member.width !== 0 && member.height !== 0).length;
      const horizontalNode = createHorizontalNode({
        id: right.id,
        members: members,
        name: right.name,
        children: [...children],
        height: maxMemberHeight + (SPACING * 2),
        width: (RIGHT_WIDTH * nonHiddenMemberCount) + (SPACING * (nonHiddenMemberCount + 1)),
        version: right.version,
        percent: right.percent,
        blameId: right.blameId,
        pools: right.pools,
      });
      if (members.every(member => member.width === 0 && member.height === 0)) {
        horizontalNode.width = 0;
        horizontalNode.height = 0;
      }
      return horizontalNode;
    } else {
      const orgIndex = orgIds.findIndex(id => id === right.rightholderId);
      const color = orgColors[orgIndex];
      const rightNode = createRightNode({
        id: right.id,
        name: right.name,
        children: [...children],
        color,
        rightHolderId: right.rightholderId,
        percent: right.percent,
        rightType: right.type,
        version: right.version,
        pools: right.pools,
      }, hiddenRightHolderIds.includes(right.rightholderId));
      return rightNode;
    }
  });

  sources.forEach(source => {
    nodes.push(createSourceNode({
      id: source.id,
      name: source.name,
      children: source.destinationId && rights.find(r => r.id === source.destinationId) ? [source.destinationId] : [],
      medias: source.medias,
      territories: source.territories,
      version: source.version,
    }));
  });

  // TODO try to improve auto-layout
  // const arrows = await autoLayout(nodes);
  const arrows = await autoLayout2(nodes);
  // const arrows = await autoLayout3(nodes);

  let minX = Infinity;
  let maxX = 0;
  let minY = Infinity;
  let maxY = 0;

  nodes.forEach(node => {
    minX = Math.min(-SPACING, minX, node.x);
    maxX = Math.max(maxX, node.x + node.width);
    minY = Math.min(-SPACING, minY, node.y);
    maxY = Math.max(maxY, node.y + node.height);
  });

  return { nodes, arrows, bounds: { minX, maxX, minY, maxY } };
}

function autoLayout(nodes: Node[]) {

  nodes = nodes.sort(() => 0.5 - Math.random());
  nodes = nodes.sort(() => 0.5 - Math.random());
  nodes = nodes.sort(() => 0.5 - Math.random());

  const g = new graphlib.Graph();

  g.setGraph({
    rankdir: 'TB',
    align: 'UL',
    nodesep: 50,
    edgesep: 10,
    ranksep: 50,
  }); // config graph option if needed

  nodes.forEach(node => {
    g.setNode(`${node.id}`, { label: `${node.id}`, width: node.width, height: node.height });

    const edgeConfig = { minlen: 2 }; // config edge option if needed
    node.children.forEach(childId => {
      g.setEdge(`${node.id}`, `${childId}`, edgeConfig);
    });
  });

  layout(g);

  nodes.forEach(node => {
    const n = g.node(`${node.id}`);
    node.x = (n as any).x;
    node.y = (n as any).y;
  });

  const arrows: Arrow[] = [];
  nodes.forEach(node => {
    const parent = node;
    node.children.forEach(childId => {
      const child = nodes.find(n => n.id === childId);
      if (!child) return;
      const arrow = getArrow(parent, child);
      arrows.push(arrow);
    });
  });

  return arrows;
}

async function autoLayout2(nodes: Node[]) {

  const engine = new LayoutEngine();
  const elkNodes: ElkNode[] = [];
  const elkEdges: ElkExtendedEdge[] = [];

  nodes.forEach(node => {
    elkNodes.push({
      id: node.id,
      width: node.width,
      height: node.height,
      layoutOptions: {
        // 'elk.priority': node.type === 'source' ? '1' : '0',
        'elk.partitioning.partition': node.type === 'source' ? '0' : '1',
      }
    });
    node.children.forEach(childId => {
      elkEdges.push({
        id: `${node.id}-${childId}`,
        sources: [node.id],
        targets: [childId],
      });
    });
  });

  const graph: ElkNode = {
    id: 'waterfall-graph',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.alignment': 'CENTER',
      'elk.edgeRouting': 'SPLINES',
      'elk.layered.mergeEdges': 'true',

      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      // 'elk.layered.layering.strategy': 'LONGEST_PATH',
      // 'elk.layered.layering.strategy': 'MIN_WIDTH',
      // 'elk.layered.layering.strategy': 'DF_MODEL_ORDER',

      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      // 'elk.layered.nodePlacement.strategy': 'SIMPLE',
      // 'elk.layered.nodePlacement.strategy': 'LINEAR_SEGMENTS',
      // 'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',

      // 'elk.topdownLayout': 'true',

      'elk.layered.spacing.nodeNodeBetweenLayers': '100.0', // vertical spacing
      'elk.spacing.nodeNode': '100', // horizontal spacing

      // 'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
      // 'elk.layered.crossingMinimization.hierarchicalSweepiness': '1',
      'elk.partitioning.activate': 'true',
    },
    children: elkNodes,
    edges: elkEdges,
  };

  try {
    const layout = await engine.layout(graph);

    layout.children.forEach(layoutNode => {
      const node = nodes.find(n => n.id === layoutNode.id);
      if (!node) return;
      node.x = layoutNode.x;
      node.y = layoutNode.y;
    });
  } catch (error) {
    // do nothing
    // when we are in between a graph update, the nodes can be inconsistent and the layout can fail
    // this is not a problem as the layout will be recomputed at the end of the update
  }

  const arrows: Arrow[] = [];
  nodes.forEach(node => {
    const parent = node;
    node.children.forEach(childId => {
      const child = nodes.find(n => n.id === childId);
      if (!child) return;
      const arrow = getArrow(parent, child);
      arrows.push(arrow);
    });
  });

  return arrows;
}

// * Debug auto layout that display everything in a grid with 10 columns
function autoLayout3(nodes: Node[]) {
  const arrows: Arrow[] = [];
  nodes.forEach((node, index) => {
    node.x = (index % 10) * 500;
    node.y = Math.floor(index / 10) * 500;

    const parent = node;
    node.children.forEach(childId => {
      const child = nodes.find(n => n.id === childId);
      if (!child) return;
      const arrow = getArrow(parent, child);
      arrows.push(arrow);
    });
  });
  return arrows;
}

export interface Arrow {
  path: string;
  parentId: string;
  childId: string;
  labelPosition: { x: number, y: number };
}

function getArrow(parent: Node, child: Node) {
  const startX = parent.x + (parent.width / 2);
  const startY = parent.y + parent.height;
  const endX = child.x + (child.width / 2);
  const endY = child.y;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // orthogonal
  // const startControlX = startX;
  // const startControlY = startY + (deltaY / 2);
  // const endControlX = endX;
  // const endControlY = startControlY;

  // spline
  const startControlX = startX;
  const startControlY = startY + (deltaY / 2);
  const endControlX = endX;
  const endControlY = startY + (deltaY / 2);

  const arrowLeftX = endX - 8;
  const arrowRightX = endX + 8;
  const arrowY = endY - 8;

  // return `M ${startX}, ${startY} L ${startControlX}, ${startControlY} L ${endControlX}, ${endControlY} L ${endX}, ${endY} L ${arrowLeftX}, ${arrowY} M ${endX}, ${endY} L ${arrowRightX}, ${arrowY}`;
  // return `M ${startX}, ${startY} L ${endX}, ${endY} L ${arrowLeftX}, ${arrowY} M ${endX}, ${endY} L ${arrowRightX}, ${arrowY}`;
  const path = `M ${startX} ${startY} C ${startControlX} ${startControlY} ${endControlX} ${endControlY} ${endX} ${endY} L ${arrowLeftX}, ${arrowY} M ${endX}, ${endY} L ${arrowRightX}, ${arrowY}`;

  const arrow: Arrow = {
    path,
    parentId: parent.id,
    childId: child.id,
    labelPosition: {
      x: startX + (deltaX / 2),
      y: startY + (deltaY / 2),
    }
  };
  return arrow;
}

const createNodeId = (str: string) => `${str}-${Math.random().toString(36).slice(2, 11)}`;

const newRightDefaultName = $localize`New right`;
const newGroupDefaultName = $localize`New group`;
const newSourceDefaultName = $localize`New source`;

export function updateParents(nodeId: string, newParentIds: string[], graph: Node[], producerId: string) {
  const parentIndex: Record<string, string[]> = {};
  graph.forEach(node => {
    node.children.forEach(childId => {
      parentIndex[childId] ||= [];
      parentIndex[childId].push(node.id);
    });
  });

  let current = graph.find(node => node.id === nodeId);
  if (current && current.type === 'source') return;
  if (!current) {
    const group = graph.find(node => (node as HorizontalNode | VerticalNode).members?.some(member => member.id === nodeId)) as HorizontalNode | VerticalNode | undefined;
    current = group?.members.find(member => member.id === nodeId);
    if (!current) return;
    const groupParents = parentIndex[group.id] ?? [];

    // if the current node has the same parents as the group, we leave it as it is
    const sameAsGroup = groupParents.every(parentId => newParentIds.includes(parentId));
    const sameAsCurrent = newParentIds.every(parentId => groupParents.includes(parentId));
    if (sameAsGroup && sameAsCurrent) return;

    // otherwise we remove the current node from the group
    group.members = group.members.filter(member => member.id !== nodeId);

    // add the current node to the graph
    graph.push(current);

    // delete the group if it has only one member left
    if (group.members.length === 1) {
      const lastMember = group.members[0];
      groupParents.forEach(parentId => {
        const parent = graph.find(node => node.id === parentId);
        if (!parent) return;
        parent.children = parent.children.filter(childId => childId !== group.id);
        parent.children.push(lastMember.id);
      });
      graph.splice(graph.findIndex(node => node.id === group.id), 1);
      graph.push(lastMember);
    }
  }

  // remove current node from its parents' children list
  const oldParentIds = parentIndex[nodeId] ?? [];
  oldParentIds.forEach(oldParentId => {
    const oldParent = graph.find(node => node.id === oldParentId);
    if (!oldParent) return;
    oldParent.children = oldParent.children.filter(childId => childId !== nodeId);
  });

  const haveSameParents = (node: Node) => {
    const parentIds = parentIndex[node.id] ?? [];
    const checkA = parentIds.every(parentId => newParentIds.includes(parentId));
    const checkB = newParentIds.every(parentId => parentIds.includes(parentId));
    return checkA && checkB;
  }

  const haveSameChildren = (node: Node) => {
    const currentChilds = current.children;
    const nodeChilds = node.children;
    const checkA = currentChilds.every(childId => nodeChilds.includes(childId));
    const checkB = nodeChilds.every(childId => currentChilds.includes(childId));
    return checkA && checkB;
  }

  const siblings = graph
    .filter(node => node.id !== nodeId) // exclude current node
    .filter(node => node.type !== 'source') // exclude sources
    .filter(node => parentIndex[node.id]?.length > 0) // exclude nodes without parents
    .filter(haveSameParents) // Must have the same parents
    .filter(haveSameChildren); // Must have the same children

  if (siblings.length > 1) throw new Error('Multiple nodes with the same parents');

  if (siblings.length) {
    const sibling = siblings[0];
    if (sibling.type === 'horizontal') {

      if (current.type === 'horizontal') {
        sibling.children = []; // groups will be merged so we keep only one children list
        graph.splice(graph.findIndex(n => n.id === sibling.id), 1); // remove one of the groups from graph
        // merge children of the two groups
        current.members.push(...sibling.members);
        current.children = current.children.filter(childId => childId !== sibling.id); // Prevent loops

        // replace sibling with current in parents' children list
        const parentIds = parentIndex[sibling.id] ?? [];
        parentIds.forEach(parentId => {
          const parent = graph.find(node => node.id === parentId);
          if (!parent) return;
          parent.children = parent.children.filter(childId => childId !== sibling.id);
          parent.children.push(current.id);
        });
      } else {
        current.children = []; // node will be grouped so it has no children anymore
        graph.splice(graph.findIndex(n => n.id === nodeId), 1); // remove node from the graph
        // add current node to existing group
        sibling.members.push(current as RightNode | VerticalNode);
      }
    } else { // we need to group
      // remove sibling from its parents' children list, and remove sibling from the graph
      const parentIds = parentIndex[sibling.id] ?? [];
      parentIds.forEach(parentId => {
        const parent = graph.find(node => node.id === parentId);
        if (!parent) return;
        parent.children = parent.children.filter(childId => childId !== sibling.id);
      });
      graph.splice(graph.findIndex(node => node.id === sibling.id), 1);

      // collect all children ids of the group
      const childrenIds = new Set<string>();
      sibling.children.forEach(childId => childrenIds.add(childId));
      current.children.forEach(childId => childrenIds.add(childId));

      // member of a group don't have any children
      sibling.children = [];

      if (current.type === 'horizontal') { // node is already a group, move sibling to it
        current.members.push(sibling as RightNode | VerticalNode);
        current.children = [...childrenIds];
        return;
      }

      current.children = []; // node will be grouped so it has no children anymore
      graph.splice(graph.findIndex(n => n.id === nodeId), 1); // remove node from the graph

      // create a new group and add it to the graph
      const group = createHorizontalNode({
        id: createNodeId('z-group'),
        name: newGroupDefaultName,
        width: RIGHT_WIDTH, height: RIGHT_HEIGHT,
        children: [...childrenIds],
        members: [sibling as RightNode | VerticalNode, current as RightNode | VerticalNode],
        blameId: producerId
      });
      graph.push(group);

      // add the new group to its new parents' children list
      newParentIds.forEach(newParentId => {
        const newParent = graph.find(node => node.id === newParentId);
        if (!newParent) return;
        if (newParent.type === 'source') newParent.children = [group.id];
        else newParent.children.push(group.id);
      });
    }
  } else {
    // add current node to its new parents' children list
    newParentIds.forEach(newParentId => {
      const newParent = graph.find(node => node.id === newParentId);
      if (!newParent) return;
      if (newParent.type === 'source') newParent.children = [nodeId];
      else newParent.children.push(nodeId);
    });
  }
}

export function createSibling(olderSiblingId: string, graph: Node[], producerId: string) {
  const olderSibling = graph.find(node => node.id === olderSiblingId || (node.type === 'horizontal' && (node as HorizontalNode).members.some(member => member.id === olderSiblingId)));
  if (!olderSibling) return;

  if (olderSibling.type === 'source') {
    const source = createSourceNode({
      id: createNodeId('z-source'),
      name: newSourceDefaultName,
    });
    graph.push(source);
    return;

  } else if (olderSibling.type === 'horizontal') {
    const right = createRightNode({
      id: createNodeId('z-right'),
      name: newRightDefaultName,
    });
    olderSibling.members.push(right);
    return;

  } else {
    const parents = graph.filter(node => node.children.includes(olderSiblingId));
    parents.forEach(parent => {
      parent.children = parent.children.filter(childId => childId !== olderSiblingId);
    });

    const children = new Set<string>();
    olderSibling.children.forEach(childId => children.add(childId));
    olderSibling.children = []; // siblings will be grouped so they have no children anymore

    // create a new right
    const right = createRightNode({
      id: createNodeId('z-right'),
      name: newRightDefaultName,
    });

    if (parents.length === 0) { // simply create a right
      graph.push(right);
      return;
    }

    // create a new group with the new right and its siblings as members
    // the children of this new group is the whole children of the siblings
    const group = createHorizontalNode({
      id: createNodeId('z-group'),
      name: newGroupDefaultName,
      width: RIGHT_WIDTH, height: RIGHT_HEIGHT,
      children: [...children],
      members: [olderSibling, right],
      blameId: producerId,
    });

    parents.forEach(parent => parent.children.push(group.id));
    graph.push(group);
    return;
  }
}

export function createChild(parentId: string, graph: Node[], producerId: string) {
  const parent = graph.find(node => node.id === parentId || (node.type === 'horizontal' && (node as HorizontalNode).members.some(member => member.id === parentId)));
  if (!parent) return;

  if (parent.children.length === 0) { // simply create a right
    const right = createRightNode({
      id: createNodeId('z-right'),
      name: newRightDefaultName,
    });
    parent.children.push(right.id);
    graph.push(right);
    return;

  } else {
    const siblings = parent.children.map(childId => graph.find(node => node.id === childId));

    /**
     * @see pipe canAddChild
     * libs/waterfall/src/lib/pipes/can-add-child.pipe.ts
     */
    if (siblings.length > 1) throw new Error($localize`Cannot add child to a node that already have many children.`);

    const sibling = siblings[0];

    // create a new right
    const right = createRightNode({
      id: createNodeId('z-right'),
      name: newRightDefaultName,
    });

    if (sibling.type === 'horizontal') { // add new right to existing group
      // add new right to existing group
      sibling.members.push(right);
    } else { // create a group and a new right and move the children to the group
      const children = new Set<string>();
      sibling.children.forEach(childId => children.add(childId));
      sibling.children = []; // sibling will be grouped so it does not have children anymore

      // create a new group with the new right and sibling as members
      // the children of this new group is the whole children of the sibling
      const group = createHorizontalNode({
        id: createNodeId('z-group'),
        name: newGroupDefaultName,
        width: RIGHT_WIDTH, height: RIGHT_HEIGHT,
        children: [...children],
        members: [sibling as RightNode | VerticalNode, right],
        blameId: producerId,
      });

      parent.children = [group.id];
      graph.push(group);
      return;
    }
  }
}

export function createStep(nodeId: string, graph: Node[], groupName?: string) {
  const group = graph.find(n => n.type === 'horizontal' && (n as HorizontalNode).members.find(m => m.id === nodeId)) as HorizontalNode;
  const groupIndex = group?.members.findIndex(member => member.id === nodeId);
  const isGroupChild = groupIndex !== undefined && groupIndex !== -1;
  const nodeIndex = graph.findIndex(node => node.id === nodeId);
  const node = isGroupChild ? group.members[groupIndex] : graph[nodeIndex];

  if (!node) return;

  // if current node is a simple right, create a new group with this right and add new right in the group
  if (node.type === 'right') {

    if (isGroupChild) {
      group.members.splice(groupIndex, 1);
    } else {
      graph.splice(nodeIndex, 1);
    }

    // update current node
    const children = [...node.children];
    const currentStepName = $localize`Step 1`;
    node.name = currentStepName;
    node.children = [];

    // create a new step right
    const right1 = createRightNode({
      id: createNodeId('z-right'),
      name: $localize`Step 2`,
      rightHolderId: node.rightHolderId ?? '',
      version: node.version,
    });

    // create a new vertical group
    const members = [node, right1];
    const verticalNode = createVerticalNode({
      id: createNodeId('z-group'),
      name: groupName || newGroupDefaultName,
      members,
      children,
      height: RIGHT_HEIGHT + (LEVEL_HEIGHT * (members.length - 1)) + (SPACING * (members.length + 1)),
      width: RIGHT_WIDTH + (SPACING * 2),
    });
    if (isGroupChild) {
      group.members.push(verticalNode);
    } else {
      graph.push(verticalNode);

      // update parents
      const parents = graph.filter(node => node.children.includes(nodeId));
      parents.forEach(parent => {
        parent.children = parent.children.filter(childId => childId !== nodeId);
        parent.children.push(verticalNode.id);
      });
    }

    return currentStepName;
  } else if (node.type === 'vertical') { // if current node is already a vertical group simply add a new member
    const right = createRightNode({
      id: createNodeId('z-right'),
      name: $localize`Step ${node.members.length + 1}`,
      rightHolderId: node.members[0].rightHolderId ?? '',
      version: node.version,
    });
    node.members.push(right);
    node.height = RIGHT_HEIGHT + (LEVEL_HEIGHT * (node.members.length - 1)) + (SPACING * (node.members.length + 1));
  } else {
    return;
  }
}

export function deleteStep(groupId: string, stepIndex: number, graph: Node[]) {
  const hGroup = graph.find(n => n.type === 'horizontal' && (n as HorizontalNode).members.find(m => m.id === groupId)) as HorizontalNode;

  const hGroupIndex = hGroup?.members.findIndex(member => member.id === groupId);
  const nodeIndex = graph.findIndex(node => node.id === groupId);
  const isHGroupChild = hGroupIndex !== undefined && hGroupIndex !== -1;
  const vGroup = isHGroupChild ? hGroup.members[hGroupIndex] : graph[nodeIndex];

  if (!vGroup || vGroup.type !== 'vertical') return;

  vGroup.members.splice(stepIndex, 1);

  vGroup.members.forEach((member, index) => {
    member.name = $localize`Step ${index + 1}`;
  });

  // if the group has only one member left, remove the group
  if (vGroup.members.length === 1) {
    const lastMember = vGroup.members[0];

    if (isHGroupChild) {
      hGroup.members.splice(hGroupIndex, 1);
      hGroup.members.push(lastMember);
    } else {
      const parents = graph.filter(node => node.children.includes(vGroup.id));
      parents.forEach(parent => {
        parent.children = parent.children.filter(childId => childId !== vGroup.id);
        parent.children.push(lastMember.id);
      });
      lastMember.children = vGroup.children;
      graph.splice(nodeIndex, 1);
      graph.push(lastMember);
    }

    return true;
  } else {
    return false;
  }
}

function createSource(node: SourceNode, version?: Version) {
  const source = createWaterfallSource({
    id: node.id,
    name: node.name,
    medias: node.medias,
    territories: node.territories,
    destinationId: node.children[0],
    version: node.version,
  });

  if (version?.standalone) {
    if (!source.version[version.id]) source.version[version.id] = {};
    source.version[version.id].standalone = true;
  }

  return source;
}

function createHorizontal(node: HorizontalNode, version?: Version, parents?: string[]): Right {
  const right = _createRight({
    id: node.id,
    name: node.name,
    nextIds: parents ?? [],
    type: 'horizontal',
    actionName: 'prependHorizontal',
    percent: node.percent,
    pools: node.pools,
    version: node.version,
    blameId: node.blameId,
  });

  if (version?.standalone) {
    if (!right.version[version.id]) right.version[version.id] = {};
    right.version[version.id].standalone = true;
  }

  return right;
}

function createVertical(node: VerticalNode, version?: Version, parents?: string[], groupId?: string): Right {
  const right = _createRight({
    id: node.id,
    name: node.name,
    groupId: groupId ?? '',
    nextIds: parents ?? [],
    type: 'vertical',
    actionName: 'prependVertical',
    percent: node.percent,
    pools: node.pools,
    version: node.version,
  });

  if (version?.standalone) {
    if (!right.version[version.id]) right.version[version.id] = {};
    right.version[version.id].standalone = true;
  }

  return right;
}

function createRight(node: RightNode, version?: Version, parents?: string[], groupId?: string, order = 0): Right {
  const right = _createRight({
    id: node.id,
    name: node.name,
    groupId: groupId ?? '',
    nextIds: parents ?? [],
    rightholderId: node.rightHolderId,
    percent: node.percent,
    pools: node.pools,
    order,
    type: node.rightType,
    version: node.version,
  });

  if (version?.standalone) {
    if (!right.version[version.id]) right.version[version.id] = {};
    right.version[version.id].standalone = true;
  }

  return right;
}

export function fromGraph(graph: readonly Node[], version?: Version) {

  const rights: Right[] = [];
  const sources: WaterfallSource[] = [];

  const parentIndex: Record<string, string[]> = {};
  graph.filter(n => n.type !== 'source').forEach(node => {
    node.children.forEach(childId => {
      parentIndex[childId] ||= [];
      parentIndex[childId].push(node.id);
    });
  });

  graph.forEach(node => {
    if (node.type === 'source') {
      const source = createSource(node, version);
      if (node.children.length > 1) console.warn(`Source (${node.id}) with multiple children: children should have been in a single group instead!`);
      sources.push(source);
    } else {
      if (node.type === 'horizontal') {
        rights.push(createHorizontal(node, version, parentIndex[node.id]));
        node.members.forEach(member => {
          if (member.type === 'vertical') {
            rights.push(createVertical(member, version, undefined, node.id));
            member.members.forEach((subMember, order) => {
              rights.push(createRight(subMember, version, undefined, member.id, order));
            });
          } else {
            rights.push(createRight(member, version, undefined, node.id));
          }
        });
      } else if (node.type === 'vertical') {
        rights.push(createVertical(node, version, parentIndex[node.id]));
        node.members.forEach((member, order) => {
          rights.push(createRight(member, version, undefined, node.id, order));
        });
      } else {
        rights.push(createRight(node, version, parentIndex[node.id]));
      }
    }
  });

  return { rights, sources };
}

export function computeDiff(
  oldGraph: { rights: Right[], sources: WaterfallSource[] },
  newGraph: { rights: Right[], sources: WaterfallSource[] },
) {

  const createdRights = newGraph.rights.filter(right => !oldGraph.rights.some(r => r.id === right.id));
  const updatedRights = newGraph.rights.filter(right => oldGraph.rights.some(r => r.id === right.id));
  const deletedRights = oldGraph.rights.filter(right => !newGraph.rights.some(r => r.id === right.id));

  const createdSources = newGraph.sources.filter(source => !oldGraph.sources.some(s => s.id === source.id));
  const updatedSources = newGraph.sources.filter(source => oldGraph.sources.some(s => s.id === source.id));
  const deletedSources = oldGraph.sources.filter(source => !newGraph.sources.some(s => s.id === source.id));

  return {
    created: { rights: createdRights, sources: createdSources },
    updated: { rights: updatedRights, sources: updatedSources },
    deleted: { rights: deletedRights, sources: deletedSources },
  };
}

