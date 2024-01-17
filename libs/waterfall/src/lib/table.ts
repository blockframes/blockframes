import { TitleState } from '@blockframes/model';
import { structuredClone } from '@blockframes/utils/helpers';

interface NodeState {
  type: 'right' | 'vertical' | 'horizontal';
  id: string;
  previous: string[];
  next: string[];
  span: number;
  groupId?: string;
  children: null | string[];
}

export interface Cell {
  id: string;
  span: number;
}

const getType = (titleState: TitleState, id: string) => {
  if (id in titleState.rights) return 'right';
  if (id in titleState.horizontals) return 'horizontal';
  if (id in titleState.verticals) return 'vertical';
  throw new Error('Node should be either a right or a group');
}

const getChildren = (titleState: TitleState, id: string) => {
  return titleState.horizontals[id]?.children
    || titleState.verticals[id]?.children;
}

const createNode = (titleState: TitleState, id: string): NodeState => ({
  id: id,
  previous: [],
  next: [],
  span: 0,
  type: getType(titleState, id),
  children: getChildren(titleState, id),
});

export function buildTable(titleState: TitleState) {
  const state: Record<string, NodeState> = {};
  const nodes = [
    ...Object.values(titleState.rights),
    ...Object.values(titleState.horizontals),
    ...Object.values(titleState.verticals),
  ];

  for (const node of nodes) {
    for (const previous of node.previous) {
      state[previous] ||= createNode(titleState, previous);
      state[previous].next.push(node.id);
    }
    state[node.id] ||= createNode(titleState, node.id);
    state[node.id].previous = node.previous;
    if ('children' in node) {
      for (const child of node.children) {
        state[child] ||= createNode(titleState, child);
        state[child].groupId = node.id;
      }
    }
  }
  // Remove isolated nodes
  for (const id in state) {
    if (!state[id].next.length && !state[id].previous.length && !state[id].groupId) delete state[id];
  }
  const columns: Record<string, Cell[][]> = {};
  const groups: Record<string, Cell[][]> = {};
  for (const [id, node] of Object.entries(state)) {
    if (!node.next.length && !node.groupId) {
      columns[node.id] = getColumn(state, id);
    } else if (node.type === 'horizontal' && !node.groupId) {
      groups[node.id] = getHorizontal(state, id);
    }
  }
  return {
    table: getTable(structuredClone(Object.values(columns))),
    groups,
    columns
  }
}

function getColumn(state: Record<string, NodeState>, rootId: string) {
  const column: string[][] = [[rootId]];
  let previous = state[rootId].previous;
  while (previous.length) {
    column.push(previous);
    previous = getPrevious(state, previous);
  }
  const table: Cell[][] = [];
  // TODO: how to fine best amount
  const max = Math.max(...column.map(row => row.length));
  for (let i = 0; i < column.length; i++) {
    const row = column[i];
    table[i] = [];
    for (let j = 0; j < row.length; j++) {
      const span = Math.ceil(max / row.length); // Span the amount of cells
      //const ids = new Array(cells).fill(row[j]);
      table[i].push({ id: row[j], span });
      state[row[j]].span += span;
    }
  }
  return table;
}

// Get the ids for the previous row base on all current items
function getPrevious(state: Record<string, NodeState>, ids: string[]) {
  const allNext = ids.map(id => state[id].previous).flat();
  return Array.from(new Set(allNext));
}


////////////////
// Main Table //
////////////////

/** Crate a table out of the columns */
function getTable(columns: Cell[][][]) {
  const table: Cell[][] = [];
  // Pad all columns to the max
  const max = Math.max(...columns.map(column => column.length));
  for (const column of columns) {
    const columnSpan = Math.max(...column.map(row => row.length));
    const pad = max - column.length;
    column.unshift(...new Array(pad).fill({ id: '', span: columnSpan }));
  }
  // Sort columns to have the same right next to one another
  const sorted = sortColumns(columns);
  // Merge cells
  for (let i = max - 1; i >= 0; i--) {
    const cells = sorted.map(column => column[i]).flat();
    table[i] = mergeCells(cells);
  }
  return table;
}

/** Merge adjacent cells if they have the same id */
function mergeCells(cells: Cell[]) {
  const result: Cell[] = [];
  let lastId: string | null = null;
  for (const cell of cells) {
    if (cell.id === lastId) {
      result[result.length - 1].span += cell.span;
    } else {
      result.push({ ...cell });
    }
    lastId = cell.id;
  }
  return result;
}

/** Sort the columns with the maximum amount of identical cells */
function sortColumns(columns: Cell[][][]) {
  return columns.sort((a, b) => {
    const columnB = b.flat().map(cell => cell.id).join();
    const columnA = a.flat().map(cell => cell.id).join();
    return columnB.localeCompare(columnA);
  })
}


////////////
// Groups //
////////////

function getHorizontal(state: Record<string, NodeState>, groupId: string) {
  const children = state[groupId].children ?? [];
  const columns: any[] = children.map(id => getCell(state, id));
  const max = Math.max(...columns.map(column => column.length));
  const table: Cell[][] = [];
  for (let i = 0; i < max; i++) {
    table[i] = columns.map(column => column[i] ?? { id: '', span: 1 });
  }
  return table;
}
function getVertical(state: Record<string, NodeState>, groupId: string) {
  const children = state[groupId].children ?? [];
  return children.map(id => getCell(state, id)).flat();
}

function getCell(state: Record<string, NodeState>, id: string): any {
  if (state[id].type === 'horizontal') {
    return getHorizontal(state, id);
  } else if (state[id].type === 'vertical') {
    return getVertical(state, id);
  } else {
    return [{ id, span: 1 }];
  }
}
