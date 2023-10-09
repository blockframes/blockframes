import { ConditionGroup } from './conditions';
import {
  createOrg,
  createRightState,
  RightState,
  TitleState,
  OrgState,
  createTransfer,
  createHorizontal,
  createVertical,
  createContractState,
  Operation,
  createBonus,
  createSourceState,
  createPoolState,
  ContractState,
} from './state';
import { getMinThreshold } from './threshold';
import { assertNode, getChildRights, getGroup, getNode, getNodeOrg, isGroupChild, isRight, updateNode } from './node';
import { WaterfallContract, WaterfallSource, getAssociatedSource } from './waterfall';
import { Income } from '../income';
import { Expense } from '../expense';
import { Term } from '../terms';
import { getContractAndAmendments, getCurrentContract, getDeclaredAmount } from '../contract';
import { convertCurrenciesTo, sortByDate, sum } from '../utils';
import { MovieCurrency } from '../static';
import { Right, orderRights } from './right';
import { Statement, isDistributorStatement } from './statement';

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
  /**
   * Add a new payment to the state.
   * Amount will not go through the tree : direct payment from A to B
   * 
   * Used to add statements related data to waterfall, that can be used in conditions.
   * Payments will increase "actual" revenue & turnover of org/groups/rigts whereas Incomes will increate the "calculated" ones.
   */
  payment,
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

export const mainCurrency: MovieCurrency = 'EUR';

export function contractsToActions(contracts: WaterfallContract[], terms: Term[]) {
  const actions: Action[] = [];

  contracts.forEach(c => {
    const declaredAmount = getDeclaredAmount({ ...c, terms: terms.filter(t => t.contractId === c.id) });
    const { [mainCurrency]: amount } = convertCurrenciesTo(declaredAmount, mainCurrency);
    const payload = {
      amount,
      id: c.rootId || c.id,
      date: c.signatureDate,
      start: c.duration.from,
      end: c.duration.to
    };

    actions.push(c.rootId ? action('updateContract', payload) : action('contract', payload));

  });

  return actions;
}

export function rightsToActions(rights: Right[]) {
  const actions: Action[] = [];

  const singleRights = orderRights(rights.filter(r => !r.groupId));
  const childRights = rights.filter(r => !!r.groupId).sort((a, b) => a.order - b.order);

  singleRights.forEach((right, index) => {
    const currentChilds = childRights.filter(r => r.groupId === right.id);
    const subChilds = currentChilds.map(c => childRights.filter(r => r.groupId === c.id)).flat();
    const date = new Date(1 + (index * 1000)); // 01/01/1970 + "index" seconds 
    const a = action(right.actionName, formatPayload(right, date, currentChilds, subChilds)) as Action;
    actions.push(a);
  });

  return actions;
}

function formatPayload(right: Right, date: Date, childs: Right[] = [], subChilds: Right[] = []) {
  switch (right.actionName) {
    case 'prepend': {
      const payload: ActionList['prepend']['payload'] = {
        id: right.id,
        orgId: right.rightholderId,
        contractId: right.contractId,
        percent: right.percent / 100,
        next: right.nextIds || [],
        date,
        pools: right.pools,
      };

      if (right.conditions) {
        payload.conditions = right.conditions;
      }

      return payload;
    }
    case 'prependHorizontal': {
      const payload: ActionList['prependHorizontal']['payload'] = {
        id: right.id,
        blameId: right.blameId,
        percent: right.percent / 100,
        next: right.nextIds || [],
        children: [],
        date,
      };

      payload.children = formatChilds(childs, subChilds);

      return payload;
    }
    case 'prependVertical': {
      const payload: ActionList['prependVertical']['payload'] = {
        id: right.id,
        percent: right.percent / 100,
        next: right.nextIds || [],
        children: [],
        date,
      };

      payload.children = formatChilds(childs);

      return payload;
    }
    default:
      break;
  }

}

function formatChilds(childs: Right[], subChilds: Right[] = []) {
  return childs.map(child => {
    const currentSubChilds = subChilds.filter(r => r.groupId === child.id);
    if (currentSubChilds.length) {
      const childRight: GroupChildVertical = {
        type: 'vertical',
        id: child.id,
        percent: child.percent / 100,
        pools: child.pools,
        children: formatChilds(currentSubChilds)
      };

      return childRight;
    } else {
      const childRight: GroupChildRight = {
        type: 'right',
        id: child.id,
        percent: child.percent / 100,
        orgId: child.rightholderId,
        contractId: child.contractId,
        conditions: child.conditions,
        pools: child.pools,
      };

      return childRight;
    }

  });
}

/**
 * Group array of actions by date
 * @param objects 
 * @param field 
 * @returns 
 */
export function groupByDate(actions: Action[]) {
  const group: { date: Date, actions: Action[] }[] = [];

  for (const obj of actions) {
    const date = obj.payload.date;
    const key = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Remove hours, min, sec if any

    const subGroup = group.find(g => g.date.getTime() === key.getTime());
    if (!subGroup) group.push({ date: key, actions: [obj] })
    else subGroup.actions.push(obj);
  }

  for (const grp of group) {
    grp.actions = sortByDate(grp.actions, 'payload.date');
  }
  return sortByDate(group, 'date');
}

export function incomesToActions(contracts: WaterfallContract[], incomes: Income[], sources: WaterfallSource[]) {
  const actions: Action[] = [];

  incomes.forEach(i => {
    const contractAndAmendments = getContractAndAmendments(i.contractId, contracts);
    // On waterfall side, the root contract is updated (updateContract), so we need to specify this one.
    const rootContract = contractAndAmendments.find(c => !c.rootId);

    const source = getAssociatedSource(i, sources);

    const { [mainCurrency]: amount } = convertCurrenciesTo({ [i.currency]: i.price }, mainCurrency);
    actions.push(
      action('income', {
        id: i.id,
        contractId: rootContract?.id || '',
        from: source.id,
        to: source.destinationId,
        amount,
        date: i.date,
        territories: i.territories,
        medias: i.medias
      })
    );
  });

  return actions;
}

export function expensesToActions(contracts: WaterfallContract[], expenses: Expense[]) {
  const actions: Action[] = [];

  expenses.forEach(e => {
    const contractAndAmendments = getContractAndAmendments(e.contractId, contracts);
    const contract = getCurrentContract(contractAndAmendments, e.date);
    const { [mainCurrency]: amount } = convertCurrenciesTo({ [e.currency]: e.price }, mainCurrency);
    actions.push(
      action('expense', {
        orgId: contract.buyerId,
        amount,
        type: e.type,
        date: e.date
      })
    );
  });

  return actions;
}

export function statementsToActions(statements: Statement[]) {
  const payments: PaymentAction[] = [];

  for (const statement of statements) {

    if (isDistributorStatement(statement)) {
      const incomePayments = statement.payments.income;
      for (const payment of incomePayments) {
        payments.push({
          id: payment.id,
          amount: convertCurrenciesTo({ [payment.currency]: payment.price }, mainCurrency)[mainCurrency],
          from: {
            income: payment.incomeId
          },
          to: {
            org: statement.rightholderId
          },
          contractId: statement.contractId,
          date: payment.date
        });
      }
    }

    const internalPayments = statement.payments.internal.filter(p => p.status === 'processed' || p.status === 'received');
    for (const payment of internalPayments) {
      payments.push({
        id: payment.id,
        amount: convertCurrenciesTo({ [payment.currency]: payment.price }, mainCurrency)[mainCurrency],
        from: {
          org: statement.rightholderId
        },
        to: {
          right: payment.to
        },
        contractId: statement.contractId,
        date: payment.date
      });
    }

    const externalPayments = statement.payments.external.filter(p => p.status === 'processed' || p.status === 'received');
    for (const payment of externalPayments) {
      payments.push({
        id: payment.id,
        amount: convertCurrenciesTo({ [payment.currency]: payment.price }, mainCurrency)[mainCurrency],
        from: {
          org: statement.rightholderId
        },
        to: {
          [payment.type === 'right' ? 'right' : 'org']: payment.to
        },
        contractId: statement.contractId,
        date: payment.date
      });
    }
  }

  return payments.map(p => action('payment', p));
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
  contractId?: ContractState['id'];
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
  const right = createRightState({ previous: toArray(previous), ...baseRight });
  state.rights[right.id] = right;
  state.orgs[right.orgId] ||= createOrg({ id: right.orgId });
  for (const pool of right.pools) {
    state.pools[pool] ||= createPoolState({ id: pool });
  }
  return right.id;
}

interface PrependRight extends RightAction {
  next: string | string[];
}
function prepend(state: TitleState, payload: PrependRight) {
  const { next, ...baseRight } = payload;
  const right = createRightState(baseRight);
  prependNode(state, toArray(next), payload.id);
  state.rights[right.id] = right;
  state.orgs[right.orgId] ||= createOrg({ id: right.orgId });
  for (const pool of right.pools) {
    state.pools[pool] ||= createPoolState({ id: pool });
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
  contractId?: ContractState['id'];
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
  state.orgs[payload.blameId] ||= createOrg({ id: payload.blameId });
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
  state.orgs[payload.blameId] ||= createOrg({ id: payload.blameId });
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

interface ExpenseAction extends BaseAction {
  orgId: OrgState['id'];
  amount: number;
  type: string;
}
function expense(state: TitleState, payload: ExpenseAction) {
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
    state.contracts[payload.id] = createContractState(payload);
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
      state.rights[child.id] = createRightState(child);
      state.orgs[child.orgId] ||= createOrg({ id: child.orgId });
      for (const pool of child.pools || []) {
        state.pools[pool] ||= createPoolState({ id: pool });;
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
  territories: string[]; // TODO #9471 should be Territory[]
  medias: string[]; // TODO #9471 should be Media[]
  isCompensation?: boolean;
}

export interface PaymentAction extends BaseAction {
  id: string;
  amount: number;
  from: {
    org?: string;
    income?: string;
  };
  to: {
    org?: string;
    right?: string;
  };
  contractId: string;
  date: Date;
}

/** Distribute the income per thresholds */
function income(state: TitleState, payload: IncomeAction) {
  // The initial right from of the income is usually a right that doesn't exist
  // If this is the case we create it
  if (payload.from) {
    state.rights[payload.from] ||= createRightState({ id: payload.from, orgId: payload.from, percent: 0 });
    if (!payload.isCompensation) {
      state.sources[payload.from] ||= createSourceState({ id: payload.from, amount: 0 });
      state.sources[payload.from].amount += payload.amount;
      state.sources[payload.from].destinationIds = Array.from(new Set([...state.sources[payload.from].destinationIds, payload.to]));
      state.sources[payload.from].incomeIds = Array.from(new Set([...state.sources[payload.from].incomeIds, payload.id]));
    }
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
      state.transfers[id].amount += transfers[id].amount * amount;
      // history should show the thresholds
      state.transfers[id].history.push({
        incomeId,
        amount: transfers[id].amount * amount,
        checked: transfers[id].checked,
        percent: transfers[id].percent
      });
    }
    for (const rightId in rights) {
      if (!state.rights[rightId]) throw new Error(`Right "${rightId}" doesn't exist`);
      const node = getNode(state, rightId);
      node.revenu.calculated += rights[rightId].revenuRate * amount;
      node.turnover.calculated += rights[rightId].turnoverRate * amount;
    }
    for (const groupId in groups) {
      assertNode(state, groupId);
      const node = getNode(state, groupId);
      node.revenu.calculated += groups[groupId].revenuRate * amount;
      node.turnover.calculated += groups[groupId].turnoverRate * amount;
    }
    for (const pool in pools) {
      if (!state.pools[pool]) throw new Error(`Pool "${pool}" doesn't exist`);
      state.pools[pool].revenu.calculated += pools[pool].revenuRate * amount;
      state.pools[pool].shadowRevenu += pools[pool].shadowRevenuRate * amount;
      state.pools[pool].turnover.calculated += pools[pool].turnoverRate * amount;
    }
    for (const orgId in orgs) {
      if (!state.orgs[orgId]) throw new Error(`Org "${orgId}" doesn't exist`);
      state.orgs[orgId].revenu.calculated += orgs[orgId].revenuRate * amount;
      state.orgs[orgId].turnover.calculated += orgs[orgId].turnoverRate * amount;


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

/**
 * Removes revenu from "from" and gives it to "to"
 * @param state 
 * @param payload 
 */
function payment(state: TitleState, payload: PaymentAction) {

  if (payload.from.org && payload.to.org) { // Payment from org to org
    if (payload.amount > state.orgs[payload.from.org].revenu.actual) throw new Error(`Org "${payload.from.org}" have not enough actual revenue to proceed.`);
    state.orgs[payload.from.org].revenu.actual -= payload.amount;
    state.orgs[payload.to.org].revenu.actual += payload.amount;
    state.orgs[payload.to.org].turnover.actual += payload.amount;
  } else if (payload.from.org && payload.to.right) { // Payment for org to right
    assertNode(state, payload.to.right);
    const orgState = getNodeOrg(state, payload.to.right);
    const nodeTo = getNode(state, payload.to.right);
    if (!isRight(state, nodeTo)) throw new Error(`Internal payment error. "${payload.to.right}" can only be a right (not a group).`);
    const actualRevenue = payload.amount;

    const actualTurnover = isGroupChild(state, nodeTo.id) ?
      payload.amount : // Inside group, childs turnover is same as revenue
      payload.amount / nodeTo.percent;

    // Rights
    nodeTo.revenu.actual += actualRevenue;
    nodeTo.turnover.actual += actualTurnover;

    // Orgs
    if (orgState.id !== payload.from.org) {
      state.orgs[payload.from.org].revenu.actual -= actualRevenue;
      state.orgs[orgState.id].revenu.actual += actualRevenue;
      state.orgs[orgState.id].turnover.actual += actualTurnover;
    }

    // Recalculate groups actual revenue & turnover
    const group = getGroup(state, nodeTo.id);
    if (group) {
      const childs = getChildRights(state, group);
      const childsActualdRevenue = sum(childs, c => c.revenu.actual);
      group.revenu.actual = childsActualdRevenue;
      group.turnover.actual = childsActualdRevenue; // For a group, turnover is sum of its childs revenue
    }

    // Pools
    const pools = nodeTo.pools.map(poolId => state.pools[poolId]);
    for (const pool of pools) {
      pool.revenu.actual += actualRevenue;
      pool.turnover.actual += actualTurnover;
    }
  } else if (payload.from.income && payload.to.org) { // Direct payment from income to org
    state.orgs[payload.to.org].revenu.actual += payload.amount;
    state.orgs[payload.to.org].turnover.actual += payload.amount;
  }

  // Logs the payment
  state.payments[payload.id] = payload;
}