
import { graphlib, layout } from 'dagre';
import LayoutEngine, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled';

import { HorizontalState, Right, RightState, SourceState, TitleState, TransferState, VerticalState, WaterfallRightholder, WaterfallSource } from '@blockframes/model';



interface NodeBase {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  children: string[];
  data: SourceState | RightState | HorizontalState | VerticalState;
}

export interface SourceNode extends NodeBase {
  type: 'source';
  data: SourceState;
};

export interface RightNode extends NodeBase {
  type: 'right';
  data: RightState;
  color: string;
  orgName: string;
}

export interface VerticalNode extends NodeBase {
  type: 'vertical';
  data: VerticalState;
  members: RightNode[];
}

export interface HorizontalNode extends NodeBase {
  type: 'horizontal';
  data: HorizontalState;
  members: (VerticalNode | RightNode)[];
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
const LEVEL_HEIGHT = 76;
const SOURCE_WIDTH = 400;
const SOURCE_HEIGHT = 70;
const SPACING = 32;


export async function toGraph(rights: Right[], sources: WaterfallSource[], state: TitleState, rightholders: WaterfallRightholder[]) {

  const orgIds = Object.keys(state.orgs).sort();
  const orgNames: Record<string, string> = {};
  orgIds.forEach(id => {
    const rightholder = rightholders.find(rh => rh.id === id);
    orgNames[id] = rightholder?.name ?? 'Unknown Org';
  })
  const orgColors = orgIds.map((_, i) => colors[i % colors.length]);

  const nodes: Node[] = rights.filter(right => right.groupId === '').map(right => {
    const children = new Set<string>(rights.filter(r => r.nextIds.includes(right.id)).map(r => r.id));

    const node = {
      id: right.id,
      name: right.name,
      x: 0, y: 0,
      width: RIGHT_WIDTH, height: RIGHT_HEIGHT,
      type: undefined,
      children: [ ...children ],
      data: undefined,
      members: undefined,
      color: undefined,
      orgName: undefined,
    };
 
    if (right.type === 'vertical') {
      const nodeState = state.verticals[right.id];
      const members: Node[] = rights.filter(r => r.groupId === right.id).map(vMember => {
        const memberState = state.rights[vMember.id];
        const orgIndex = orgIds.findIndex(id => id === memberState.orgId);
        const color = orgColors[orgIndex];
        return {
          id: vMember.id,
          name: vMember.name,
          x: 0, y: 0,
          width: RIGHT_WIDTH, height: RIGHT_HEIGHT,
          type: 'right',
          children: [],
          data: memberState,
          color,
          orgName: orgNames[memberState.orgId],
        };
      });

      node.type = 'vertical';
      node.members = members;
      node.height = RIGHT_HEIGHT + (LEVEL_HEIGHT * (members.length - 1)) + (SPACING * (members.length + 1));
      node.width = RIGHT_WIDTH + (SPACING * 2);
      node.data = nodeState;
    } else if (right.type === 'horizontal') {
      const nodeState = state.horizontals[right.id];
      const members = rights.filter(r => r.groupId === right.id).map(member => {
        if (member.type === 'vertical') {
          const memberState = state.verticals[member.id];
          const vMembers: Node[] = rights.filter(r => r.groupId === member.id).map(vMember => {
            const vMemberState = state.rights[vMember.id];
            const orgIndex = orgIds.findIndex(id => id === vMemberState.orgId);
            const color = orgColors[orgIndex];
            return {
              id: vMember.id,
              name: vMember.name,
              x: 0, y: 0,
              width: RIGHT_WIDTH, height: RIGHT_HEIGHT,
              type: 'right',
              children: [],
              data: vMemberState,
              color,
              orgName: orgNames[vMemberState.orgId],
            };
          });
          return {
            id: member.id,
            name: member.name,
            x: 0, y: 0,
            width:  RIGHT_WIDTH + (SPACING * 2), height: RIGHT_HEIGHT + (LEVEL_HEIGHT * (vMembers.length - 1)) + (SPACING * (vMembers.length + 1)),
            type: 'vertical',
            children: [],
            members: vMembers,
            data: memberState,
          };
        } else {
          const memberState = state.rights[member.id];
          const orgIndex = orgIds.findIndex(id => id === memberState.orgId);
          const color = orgColors[orgIndex];
          return {
            id: member.id,
            name: member.name,
            x: 0, y: 0,
            width: RIGHT_WIDTH, height: RIGHT_HEIGHT,
            type: 'right',
            children: [],
            data: memberState,
            color,
            orgName: orgNames[memberState.orgId],
          };
        }
      });
      const maxMemberHeight = Math.max(...members.map(member => member.height));
      node.type = 'horizontal';
      node.members = members;
      node.height = maxMemberHeight + (SPACING * 2);
      node.width = (RIGHT_WIDTH * members.length) + (SPACING * (members.length + 1));
      node.data = nodeState;
    } else {
      const nodeState = state.rights[right.id];
      const orgIndex = orgIds.findIndex(id => id === nodeState.orgId);
      const color = orgColors[orgIndex];
      node.type = 'right';
      node.data = nodeState;
      node.color = color;
      node.orgName = orgNames[nodeState.orgId];
    }

    return node;
  });

  sources.forEach(source => {
    const nodeState = state.sources[source.id];
    nodes.push({
      id: source.id,
      name: source.name,
      x: 0, y: 0,
      width: SOURCE_WIDTH, height: SOURCE_HEIGHT,
      type: 'source',
      children: [ source.destinationId ],
      data: nodeState,
    });
  });

  // TODO try to improve auto-layout
  // const arrows = await autoLayout(nodes, Object.values(state.transfers));
  const arrows = await autoLayout2(nodes, Object.values(state.transfers));
  // const arrows = await autoLayout3(nodes, Object.values(state.transfers));

  let minX = Infinity;
  let maxX = 0;
  let minY = Infinity;
  let maxY = 0;

  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x + node.width);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y + node.height);
  });

  return { nodes, arrows, bounds: { minX, maxX, minY, maxY } };
}










function autoLayout(nodes: Node[], transfers: TransferState[]) {

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
      const arrow = getArrow(parent, child, transfers);
      arrows.push(arrow);
    });
  });

  return arrows;
}

async function autoLayout2(nodes: Node[], transfers: TransferState[]) {

  // nodes = nodes.sort(() => 0.5 - Math.random());
  // nodes = nodes.sort(() => 0.5 - Math.random());
  // nodes = nodes.sort(() => 0.5 - Math.random());

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
    id: 'cfg',
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

  const layout = await engine.layout(graph);

  layout.children.forEach(layoutNode => {
    const node = nodes.find(n => n.id === layoutNode.id);
    if (!node) return;
    node.x = layoutNode.x;
    node.y = layoutNode.y;
  });

  const arrows: Arrow[] = [];
  nodes.forEach(node => {
    const parent = node;
    node.children.forEach(childId => {
      const child = nodes.find(n => n.id === childId);
      if (!child) return;
      const arrow = getArrow(parent, child, transfers);
      arrows.push(arrow);
    });
  });

  return arrows;
}

// * Debug auto layout that display everything in a grid with 10 columns
function autoLayout3(nodes: Node[], transfers: TransferState[]) {
  const arrows: Arrow[] = [];
  nodes.forEach((node, index) => {
    node.x = (index % 10) * 500;
    node.y = Math.floor(index / 10) * 500;

    const parent = node;
    node.children.forEach(childId => {
      const child = nodes.find(n => n.id === childId);
      if (!child) return;
      const arrow = getArrow(parent, child, transfers);
      arrows.push(arrow);
    });
  });
  return arrows;
}

export interface Arrow {
  path: string;
  amount: number;
  labelPosition: { x: number, y: number };
};

function getArrow(parent: Node, child: Node, transfers: TransferState[]) {
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
  
  const amount = transfers.find(t => t.from === parent.id && t.to === child.id)?.amount ?? 0;
  
  const arrow: Arrow = {
    path,
    amount,
    labelPosition: {
      x: startX + (deltaX / 2),
      y: startY + (deltaY / 2),
    }
  };
  return arrow;
}
