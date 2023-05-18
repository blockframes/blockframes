import { ConditionGroup } from './conditions';
import {
  createOrg,
  createRight,
  RightState,
  TitleState,
  OrgState,
  createTransfer,
  createHorizontal,
  createVertical,
  createContract,
  Operation,
  createBonus
} from './state';
import { getMinThreshold } from './threshold';
import { assertNode, getNode, updateNode } from './node';

const actions = {
  /**
   * Add a new right to waterfall.
   * "previous" attribute needs to be specified and refers to the node(s) bellow.
   */
  append,
  appendHorizontal,
  appendVertical,
  /**
   * Add a new right to waterfall.
   * "next" attribute needs to be specified and refers to the node(s) above.
   */
  prepend,
  prependHorizontal,
  prependVertical,
  invest,
  income,
  /** @deprecated not used. Might be removed in future */
  bonus,
  /** @deprecated not used. Might be removed in future */
  onEvent,
  /**
   * Can be used to emit an external event, for example:
   *  - title won an award
   *  - distributor sold 4000 dvd
   * 
   * Event have an id (example: fr_dvd_sold) and a value (4_000).
   * Event can then be used in conditions, for example:
   *  - condition('event', { eventId: 'fr_dvd_sold', operator: '<=', value: 4_000 })
   */
  emitEvent,
  expense,
  updateRight,
  /**
   * Add a new contract to waterfall.
   * Contracts have an amount, a signature date and a start and end date
   * 
   * Contracts amount can be used in condition contractAmount to filter an income
   * Contracts dates can be used in condition contractDate to filter an income
   */
  contract,
  /**
   * Update an existing contract
   */
  updateContract,
}

export const actionNames = Object.keys(actions);

export type ActionName = keyof typeof actions;
export type ActionList = {
  [key in ActionName]: {
    name: key,
    payload: Parameters<typeof actions[key]>[1],
  }
};
export type Action = ActionList[keyof ActionList] & { actionId: string };

export const action = <N extends ActionName>(name: N, payload: ActionList[N]['payload']) => {
  return { name, payload, actionId: Math.round(Math.random() * 1000000).toString() };
}

export function createAction(params: Partial<Action> = {}) {
  return {
    actionId: '',
    name: '',
    payload: {},
    ...params
  } as Action;
}

export function runAction<N extends ActionName>(
  state: TitleState,
  name: N,
  payload: ActionList[N]['payload']
): ReturnType<(typeof actions)[N]> {
  if (payload.date) state.date = payload.date;
  return actions[name](state, payload as any) as any;
}

/////////////
// ACTIONS //
/////////////
interface BaseAction {
  date?: Date;
}

export interface RightAction extends BaseAction {
  id: RightState['id'];
  orgId: OrgState['id'];
  percent: number;
  conditions?: ConditionGroup;
  /** Pools that each income will increase when it arrives on the right */
  pools?: string[];
}

interface AppendRight extends RightAction {
  previous: string | string[];
}
function append(state: TitleState, payload: AppendRight) {
  const { previous, ...baseRight } = payload;
  const right = createRight({ previous: toArray(previous), ...baseRight });
  state.rights[right.id] = right;
  state.orgs[right.orgId] ||= createOrg({ id: right.orgId });
  for (const pool of right.pools) {
    state.pools[pool] ||= { revenu: 0, turnover: 0, shadowRevenu: 0 };
  }
  return right.id;
}

interface PrependRight extends RightAction {
  next: string | string[];
}
function prepend(state: TitleState, payload: PrependRight) {
  const { next, ...baseRight } = payload;
  const right = createRight(baseRight);
  prependNode(state, toArray(next), payload.id);
  state.rights[right.id] = right;
  state.orgs[right.orgId] ||= createOrg({ id: right.orgId });
  for (const pool of right.pools) {
    state.pools[pool] ||= { revenu: 0, turnover: 0, shadowRevenu: 0 };
  }
  return right.id;
}


// HORIZONTAL GROUP //
interface BaseGroupChild {
  id: string;
  percent?: number;
  pools?: string[];
}

interface GroupChildVertical extends BaseGroupChild {
  type: 'vertical';
  children: GroupChild[];
}
interface GroupChildHorizontal extends BaseGroupChild {
  type: 'horizontal';
  children: GroupChild[];
  blameId: string;
}
interface GroupChildRight extends BaseGroupChild {
  type: 'right';
  percent: number;
  conditions?: ConditionGroup;
  orgId: OrgState['id'];
}

export type GroupChild = GroupChildVertical | GroupChildHorizontal | GroupChildRight;

interface AppendGroup extends BaseAction {
  id: string;
  previous: string | string[];
  children: GroupChild[];
  percent?: number;
}

interface AppendHorizontal extends AppendGroup {
  blameId: string;
}

function appendHorizontal(state: TitleState, payload: AppendHorizontal) {
  createGroupChildren(state, payload.children);
  state.horizontals[payload.id] = createHorizontal({
    id: payload.id,
    percent: payload.percent,
    previous: toArray(payload.previous),
    children: payload.children,
    blameId: payload.blameId,
  });
}

interface PrependGroup extends BaseAction {
  id: string;
  next: string | string[];
  children: GroupChild[];
  percent?: number;
}
interface PrependHorizontal extends PrependGroup {
  blameId: string;
}

function prependHorizontal(state: TitleState, payload: PrependHorizontal) {
  createGroupChildren(state, payload.children);
  prependNode(state, toArray(payload.next), payload.id);
  state.horizontals[payload.id] = createHorizontal({
    id: payload.id,
    percent: payload.percent,
    previous: [],
    children: payload.children,
    blameId: payload.blameId,
  });
}


function appendVertical(state: TitleState, payload: AppendGroup) {
  createGroupChildren(state, payload.children);
  state.verticals[payload.id] = createVertical({
    id: payload.id,
    previous: toArray(payload.previous),
    children: payload.children
  });
}

function prependVertical(state: TitleState, payload: PrependGroup) {
  createGroupChildren(state, payload.children);
  prependNode(state, toArray(payload.next), payload.id);
  state.verticals[payload.id] = createVertical({
    id: payload.id,
    previous: [],
    children: payload.children
  });
}

interface UpdateRight extends Partial<RightAction> {
  id: RightState['id'];
  date: Date;
  previous?: string[];
}
function updateRight(state: TitleState, payload: UpdateRight) {
  const node = getNode(state, payload.id);
  updateNode(state, { ...node, ...payload });
  if (payload.orgId) state.orgs[payload.orgId] ||= createOrg({ id: payload.orgId });
}

interface Investment extends BaseAction {
  orgId: OrgState['id'];
  amount: number;
}
function invest(state: TitleState, payload: Investment) {
  const { amount, orgId } = payload;
  state.investment += amount;
  state.orgs[orgId] ||= createOrg({ id: orgId });
  state.orgs[orgId].investment += amount;
  state.orgs[orgId].operations.push({
    type: 'investment',
    amount,
    date: payload.date ?? new Date(),
  })
}

interface Expense extends BaseAction {
  orgId: OrgState['id'];
  amount: number;
  type: string;
}
function expense(state: TitleState, payload: Expense) {
  const { amount, orgId, type } = payload;

  state.expense[type] ||= 0;
  state.expense[type] += amount;

  state.orgs[orgId] ||= createOrg({ id: orgId });
  state.orgs[orgId].expense += amount;
}

export interface Bonus extends BaseAction {
  from?: OrgState['id'];
  to: OrgState['id'];
  amount: number;
}
function bonus(state: TitleState, payload: Bonus) {
  const { from, to, amount } = payload;
  if (from) state.orgs[from].bonus -= amount;
  state.orgs[to].bonus += amount;
}

export interface OnEvent extends BaseAction {
  eventId: string;
  actions: Action[];
}
function onEvent(state: TitleState, payload: OnEvent) {
  const { eventId, actions } = payload;
  state.onEvents[eventId] = actions;
}

export interface EmitEvent extends BaseAction {
  eventId: string;
  value: unknown;
}
function emitEvent(state: TitleState, payload: EmitEvent) {
  const { eventId, value } = payload;
  state.events[eventId] = value;
  if (state.onEvents[eventId]) {
    const actions = state.onEvents[eventId];
    for (const action of actions) {
      runAction(state, action.name, action.payload);
    }
  }
}

interface Contract extends BaseAction {
  id: string;
  amount: number;
  start?: Date;
  end?: Date;
}
function contract(state: TitleState, payload: Contract) {
  if (!state.contracts[payload.id]) {
    state.contracts[payload.id] = createContract(payload);
  }
}

function updateContract(state: TitleState, payload: Partial<Contract> & { id: string }) {
  if (!state.contracts[payload.id]) throw new Error(`Contract "${payload.id}" not found`);
  state.contracts[payload.id] = { ...state.contracts[payload.id], ...payload };
}

///////////
// UTILS //
///////////

function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

function createGroupChildren(state: TitleState, children: GroupChild[]) {
  for (const child of children) {
    if (child.type === 'right') {
      state.rights[child.id] = createRight(child);
      state.orgs[child.orgId] ||= createOrg({ id: child.orgId });
      for (const pool of child.pools || []) {
        state.pools[pool] ||= { revenu: 0, turnover: 0, shadowRevenu: 0 };
      }
    }
    if (child.type === 'horizontal') {
      state.horizontals[child.id] = createHorizontal(child);
      createGroupChildren(state, child.children);
    }
    if (child.type === 'vertical') {
      state.verticals[child.id] = createVertical(child);
      createGroupChildren(state, child.children);
    }
  }
}

function prependNode(state: TitleState, nextIds: string[], nodeId: string) {
  for (const nextId of nextIds) {
    if (nextId in state.rights) {
      state.rights[nextId].previous.push(nodeId);
    } else if (nextId in state.horizontals) {
      state.horizontals[nextId].previous.push(nodeId);
    } else if (nextId in state.verticals) {
      state.verticals[nextId].previous.push(nodeId);
    } else {
      throw new Error(`Node with id "${nextId}" is not part of the state`);
    }
  }
}

export interface IncomeAction extends BaseAction {
  id: string;
  amount: number;
  to: string;
  from?: string;
  contractId?: string;
  territory: string[];
  media: string[];
  isCompensation?: boolean;
}

/** Distribute the income per thresholds */
function income(state: TitleState, payload: IncomeAction) {
  // The initial right from of the income is usually a right that doesn't exist
  // If this is the case we create it
  if (payload.from) {
    state.rights[payload.from] ||= createRight({ id: payload.from, orgId: payload.from, percent: 0 });
  }
  state.incomes[payload.id] = payload;
  const incomeId = payload.id;
  let rest = payload.amount;
  // List of income operation per orgs
  const operations: Record<string, Operation> = {};

  while (rest > 0 || (payload.isCompensation && rest < 0)) {
    const { threshold, rights, orgs, pools, transfers, groups, bonuses } = getMinThreshold(state, { ...payload, amount: rest });
    const amount = Math.min(threshold, rest);
    for (const transfer in transfers) {
      const id = transfer as `${string}->${string}`;
      state.transfers[id] ||= createTransfer(id);
      state.transfers[id].amount += transfers[id] * amount;
      // history should show the thresholds
      state.transfers[id].history.push({ incomeId, amount: transfers[id] * amount });
    }
    for (const rightId in rights) {
      if (!state.rights[rightId]) throw new Error(`Right "${rightId}" doesn't exist`);
      const node = getNode(state, rightId);
      node.revenu += rights[rightId].revenuRate * amount;
      node.turnover += rights[rightId].turnoverRate * amount;
    }
    for (const groupId in groups) {
      assertNode(state, groupId);
      const node = getNode(state, groupId);
      node.revenu += groups[groupId].revenuRate * amount;
      node.turnover += groups[groupId].turnoverRate * amount;
    }
    for (const pool in pools) {
      if (!state.pools[pool]) throw new Error(`Pool "${pool}" doesn't exist`);
      state.pools[pool].revenu += pools[pool].revenuRate * amount;
      state.pools[pool].shadowRevenu += pools[pool].shadowRevenuRate * amount;
      state.pools[pool].turnover += pools[pool].turnoverRate * amount;
    }
    for (const orgId in orgs) {
      if (!state.orgs[orgId]) throw new Error(`Org "${orgId}" doesn't exist`);
      state.orgs[orgId].revenu += orgs[orgId].revenuRate * amount;
      state.orgs[orgId].turnover += orgs[orgId].turnoverRate * amount;


      // Operation
      if (orgs[orgId].revenuRate) {
        // Append the operation into the array if it doesn't exist
        if (!operations[orgId]) {
          const operation = { type: 'income' as const, amount: 0, date: payload.date ?? new Date() };
          const length = state.orgs[orgId].operations.push(operation);
          operations[orgId] = state.orgs[orgId].operations[length - 1];
        }
        // Increment the amount of the operation
        operations[orgId].amount += orgs[orgId].revenuRate * amount;
      }
    }
    for (const groupId in bonuses) {
      const { orgId, bonusRate } = bonuses[groupId];
      const bonusId = `${incomeId}-${groupId}` as `${string}-${string}`;
      state.bonuses[bonusId] ||= createBonus({ groupId, incomeId, orgId });
      state.bonuses[bonusId].amount += bonusRate * amount;
      if (!state.orgs[orgId]) throw new Error(`Org "${orgId}" doesn't exist`);
      state.orgs[orgId].bonus += bonusRate * amount;
    }
    rest -= amount;
  }
}