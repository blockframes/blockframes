import { TitleState } from '@blockframes/model';
import { EdgeConfig, NodeConfig, ComboConfig, GraphData, TreeGraph, Tooltip, GraphOptions } from '@antv/g6';
import { DagreLayout } from '@antv/layout';

const roundCent = (value: number) => Math.round(value * 100) / 100;
const toColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const [r, g, b] = [
    (hash >> (0 * 8)) & 255,
    (hash >> (1 * 8)) & 255,
    (hash >> (2 * 8)) & 255,
  ];
  return `rgb(${r}, ${g}, ${b})`;
}

export function toG6(state: TitleState): GraphData {
  const nodes: NodeConfig[] = [];
  const edges: EdgeConfig[] = [];
  const combos: ComboConfig[] = [];

  // Map the rights in a group with the combo id it should be in
  const rightCombo: Record<string, string> = {};
  const groupCombo: Record<string, string> = {};

  // Horizontal Group
  for (const group of Object.values(state.horizontals)) {
    const comboLabel = group.percent
      ? `${group.id} (${roundCent(group.percent * 100)}%): ${roundCent(group.revenu)}€`
      : `${group.id}: ${roundCent(group.revenu)}€`;
    combos.push({
      id: group.id,
      label: comboLabel,
      padding: 24,
    });
    for (const childId of group.children) {
      if (childId in state.rights) rightCombo[childId] = group.id;
      if (childId in state.horizontals) groupCombo[childId] = group.id;
      if (childId in state.verticals) groupCombo[childId] = group.id;
    }
    // Fill nodes with no transfers
    for (const previous of group.previous) {
      const transferId = `${group.id}->${previous}` as const;
      if (!state.transfers[transferId]) {
        edges.push({
          type: 'cubic-vertical',
          id: transferId,
          label: '0€',
          source: group.id,
          target: previous,
          history: []
        })
      }
    }
  }

  // Vertical Group
  for (const vertical of Object.values(state.verticals)) {
    const comboLabel = vertical.percent
      ? `${vertical.id} (${roundCent(vertical.percent * 100)}%): ${roundCent(vertical.revenu)}€`
      : `${vertical.id}: ${roundCent(vertical.revenu)}€`;
    combos.push({
      id: vertical.id,
      label: comboLabel,
      padding: 24
    });
    for (let i = 0; i < vertical.children.length; i++) {
      const childId = vertical.children[i];
      if (childId in state.rights) rightCombo[childId] = vertical.id;
      if (childId in state.horizontals) groupCombo[childId] = vertical.id;
      if (childId in state.verticals) groupCombo[childId] = vertical.id;
      if (i === 0) continue;
      edges.push({
        type: 'cubic-vertical',
        style: { lineDash: [2] },
        id: `${vertical.children[i - 1]}->${childId}`,
        source: vertical.children[i - 1],
        target: childId,
        history: []
      })
    }
    for (const previous of vertical.previous) {
      const transferId = `${vertical.id}->${previous}` as const;
      if (!state.transfers[transferId]) {
        edges.push({
          type: 'cubic-vertical',
          id: transferId,
          label: '0€',
          source: vertical.id,
          target: previous,
          history: []
        })
      }
    }
  }

  for (const combo of combos) {
    if (groupCombo[combo.id]) combo.parentId = groupCombo[combo.id];
  }

  // Rights -> node
  for (const right of Object.values(state.rights)) {
    const labelLines: string[] = [`${roundCent(right.percent * 100)}%`];
    nodes.push({
      id: right.id,
      label: labelLines.join('\n'),
      type: 'rect',
      comboId: rightCombo[right.id],
      style: {
        fill: toColor(right.orgId)
      }
    });

    // Fill nodes with no transfers
    for (const previous of right.previous) {
      const transferId = `${right.id}->${previous}` as const;
      if (!state.transfers[transferId]) {
        edges.push({
          type: 'cubic-vertical',
          id: transferId,
          label: '0€',
          source: right.id,
          target: previous,
          history: []
        })
      }
    }
  }


  // transfers
  for (const transfer of Object.values(state.transfers)) {
    const edge: EdgeConfig = {
      type: 'cubic-vertical',
      id: transfer.id,
      label: `${roundCent(transfer.amount)}€`,
      source: transfer.from,
      target: transfer.to,
      history: transfer.history
    };

    const compensations = transfer.history.filter(h => state.incomes[h.incomeId].isCompensation);
    if (compensations.length) {
      const compensationAmount = compensations.reduce((sum, current) => sum + current.amount, 0);
      if (compensationAmount !== 0) {
        edge.label = transfer.amount - compensationAmount ?
          `${roundCent(transfer.amount - compensationAmount)} (${compensationAmount > 0 ? '+' : ''} ${roundCent(compensationAmount)} )€` :
          `${roundCent(transfer.amount)}€`
        edge.labelCfg = { style: { fill: compensationAmount > 0 ? 'green' : 'red' } };
        edge.style = { stroke: compensationAmount > 0 ? 'green' : 'red' };
      }
    }

    edges.push(edge);
  }

  return { nodes, edges, combos };
}

const tooltip = new Tooltip({
  offsetX: 10,
  offsetY: 10,
  itemTypes: ['node', 'edge'],
  getContent: (e) => e?.item?.getID() ?? '',
});

export const graphOptions: Omit<GraphOptions, 'container'> = {
  fitView: true,
  modes: {
    default: ['drag-canvas', 'zoom-canvas', 'drag-combo', 'drag-node', {
      type: 'collapse-expand-combo',
      relayout: false,
    }]
  },
  plugins: [tooltip],
  // layout: {
  //   type: 'dagre',
  //   sortByCombo: true, // This should work: we need to open an issue with reproduction step & link
  // },
  layout: {
    type: 'comboCombined',
    center: [200, 200],
    nodeSize: 60,
    spacing: 60,
    comboPadding: 20,
    outerLayout: new DagreLayout({
      type: 'dagre',
      ranksep: 30,
      nodesep: 30,
    }),
    innerLayout: new DagreLayout({
      type: 'dagre',
      align: 'DR',
      ranksep: 30,
      nodesep: 30
    }),
  },
  defaultNode: {
    shape: 'rect',
    anchorPoints: [[0.5, 0], [0.5, 1]],
    size: [120, 64],
    style: {
      fill: '#37373f',
      stroke: 'transparent',
      radius: 4
    },
    labelCfg: {
      style: {
        fill: '#fff',
        fontSize: 14
      }
    },
  },
  defaultEdge: {
    shape: 'cubic-vertical', // 'polyline',
    style: {
      radius: 10,
      offset: 30,
      endArrow: true,
      stroke: '#37373f'
    }
  },
  defaultCombo: {
    type: 'rect',
    anchorPoints: [[0.5, 0], [0.5, 1]],
  },
}

export function setupTreeGraph(container = 'container', width: number, height: number) {
  const graph = new TreeGraph({
    container,
    width,
    height,
    modes: {
      default: [
        {
          type: 'collapse-expand',
          onChange: (item: any, collapsed) => {
            const data = item.getModel();
            data.collapsed = collapsed;
            return true;
          },
        },
        'drag-canvas',
        'zoom-canvas',
      ],
    },
    defaultNode: {
      size: 26,
      anchorPoints: [
        [0, 0.5],
        [1, 0.5],
      ],
    },
    defaultEdge: {
      type: 'cubic-horizontal',
    },
    layout: {
      type: 'compactBox',
      direction: 'LR',
      getId: (d: any) => {
        return d.id;
      },
      getHeight: () => {
        return 16;
      },
      getWidth: () => {
        return 16;
      },
      getVGap: () => {
        return 10;
      },
      getHGap: () => {
        return 100;
      },
    },
  });

  graph.node((node) => {
    return {
      label: node.label,
      labelCfg: {
        offset: 10,
        position: node.children && node.children.length > 0 ? 'left' : 'right',
      },
    };
  });

  return graph;
}