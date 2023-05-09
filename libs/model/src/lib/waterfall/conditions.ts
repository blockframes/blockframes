import { IncomeAction as Income } from './action';
import { investmentWithInterest } from './interest';
import { RightState, TitleState } from './state';
import { assertNode, getNode } from './node';


export const thresholdConditions = {
  /** Will compare current amount arriving on node with org revenue */
  orgRevenu,
  /** 
   * The amount that passed by a specific org.
   * 
   * Example: 
   *  1 - 100k comes from previous node to a right that belons to org A.
   *  2 - org A takes 50%
   *  3 - org A revenue is 50k but turnover is 100k
   */
  orgTurnover,
  /**
   * Similator to org revenue.
   * 
   * Example:
   * Org can be seller & investor but we might want to add a condition
   * on org revenue generated by his seller actitivies and not the investor one
   */
  poolRevenu,
  /** See poolRevenu & OrgTurnover */
  poolTurnover,
  /** Revenue generated by a specific right */
  rightRevenu,
  /** Amount that passed by a specific right*/
  rightTurnover,
  /** Revenue generated by a specific group */
  groupRevenu,
  /** Amount that passed by a specific group*/
  groupTurnover,
  /**
   * Condition that will keep incoming amount (investment, income) until interests are covered.
   * Interests are taken on incomes, investments and new years.
   * Interest can be composite: interests of each period are incorporated into the capital to increase it gradually.
   * Next interests will be calculated from increased capital.
   * (Income and investments must have a date)
   */
  interest,
}

export const blockingConditions = {
  /** Condition that will match if a event was triggered or not triggered */
  event,
  /** 
   * Condition that will match only if income comes before or after a given date 
   * 
   * If "from" is specified, date will be checked against income date to check if date is after "from"
   * If "to" is specified, date will be checked against income date to check if date is before "to"
   * 
   */
  incomeDate,
  /**
   * Every income should be linked to a contract.
   * This will check if contract date linked to income matches the condition or not.
   * 
   * If "from" is specified, date will be checked against contract start date to check if contract start date is after "from"
   * If "to" is specified, date will be checked against contract end date to check if contract end date is before "to"
   * 
   */
  contractDate,
  /** @deprecated use contractAmount instead */
  amount,
  /** Condition that will match only if income comes from specific media(s) or territory(ies) */
  terms,
  /** @deprecated not used. Might be removed in future */
  termsLength,
  /**
   * Condition on a right to take or not take income comming from a 
   * specific contract
   */
  contract,
  /**
   * Condition on a right to take or not take income comming from contract with a specific amount.
   * 
   * Example:
   *  - if a contract is made between distributor & seller for an amount greater than 50k
   */
  contractAmount,
}

export const allConditions = {
  ...blockingConditions,
  ...thresholdConditions
};

export const conditionNames = Object.keys(allConditions);

export type ConditionName = keyof typeof allConditions;
export type ConditionList = {
  [key in ConditionName]: {
    name: key,
    payload: Parameters<typeof allConditions[key]>[1],
  }
};

export type ThresholdCondition = ConditionList[keyof typeof thresholdConditions];
export type BlockingCondition = ConditionList[keyof typeof blockingConditions];
export type Condition = ThresholdCondition | BlockingCondition;

interface ConditionContext {
  state: TitleState;
  /** Current right on which the condition is triggered */
  right: RightState;
  /** Amount of income that arrives on the right */
  income: Income;
}

export function isThresholdCondition(condition: Condition): condition is ThresholdCondition {
  return Object.keys(thresholdConditions).includes(condition.name as any);
}
export function splitConditions(group: ConditionGroup) {
  const thresholdCdts: ThresholdCondition[] = [];
  const blockingCdts: BlockingCondition[] = [];
  for (const condition of group.conditions) {
    if (isConditionGroup(condition)) {
      const splitted = splitConditions(condition);
      thresholdCdts.push(...splitted.thresholdCdts);
      blockingCdts.push(...splitted.blockingCdts);
    } else {
      isThresholdCondition(condition)
        ? thresholdCdts.push(condition)
        : blockingCdts.push(condition);
    }
  }
  return { thresholdCdts, blockingCdts };
}

// Utils
type NumberOperator = '==' | '!=' | '<' | '>=';
type ArrayOperator = 'in' | 'not-in';
/** Blocking operation will always return either the total amount or nothing */
function numericOperator(operator: NumberOperator, current: number, target: number) {
  switch (operator) {
    case '==': return current === target;
    case '!=': return current !== target;
    case '>=': return current >= target;
    case '<': return current < target;
    default: throw new Error(`Condition should have one of the operators "==", "!=", ">", "<", ">=", "<=", but got ${operator}`);
  }
}

//////////////////////
// Condition groups //
//////////////////////

export function checkCondition(ctx: ConditionContext) {
  return checkGroupCondition(ctx, ctx.right.conditions);
}

export const isConditionGroup = (condition: Condition | ConditionGroup): condition is ConditionGroup => {
  return 'operator' in condition;
}

interface ConditionResult {
  checked: boolean;
}

function runCondition(ctx: ConditionContext, condition: Condition) {
  const { name, payload } = condition;
  return allConditions[name](ctx, payload as any);
}

function checkGroupCondition(ctx: ConditionContext, group: ConditionGroup): ConditionResult {
  const { operator, conditions: allConditions } = group;
  if (!allConditions.length) return { checked: true };
  const result: ConditionResult[] = [];
  for (const condition of allConditions) {
    if (isConditionGroup(condition)) {
      const { checked } = checkGroupCondition(ctx, condition);
      result.push({ checked });
    } else {
      // TODO: condition should return false when condition not ready...
      const checked = runCondition(ctx, condition);
      result.push({ checked });
    }
  }

  if (operator === 'AND') {
    const checked = result.every(r => r.checked);
    return { checked };
  } else {
    const checked = result.some(r => r.checked);
    return { checked };
  }
}

export const condition = <N extends ConditionName>(name: N, payload: ConditionList[N]['payload']) => {
  return { name, payload };
}

export interface ConditionGroup {
  operator: 'OR' | 'AND';
  conditions: (Condition | ConditionGroup)[];
}

export function and(conditions: (Condition | ConditionGroup)[]): ConditionGroup {
  return { operator: 'AND', conditions };
}
export function or(conditions: (Condition | ConditionGroup)[]): ConditionGroup {
  return { operator: 'OR', conditions };
}


///////////////
// REFERENCE //
///////////////

const isNumber = (v: unknown): v is number => typeof v === 'number';

type TargetIn = 'orgs.revenu' | 'orgs.turnover' | 'orgs.expense' | 'rights.revenu' | 'rights.turnover' | 'pools.revenu' | 'pools.turnover' | 'investment' | 'expense';
type TargetValue = {
  id: string;
  percent: number;
  in: TargetIn
} | number;
export function toTargetValue(state: TitleState, target: TargetValue) {
  if (isNumber(target)) return target;

  const { id, percent } = target;
  switch (target.in) {
    case 'orgs.revenu': return state.orgs[id].revenu * percent;
    case 'orgs.turnover': return state.orgs[id].turnover * percent;
    case 'orgs.expense': return state.orgs[id].expense * percent;
    case 'rights.revenu': return getNode(state, id).revenu * percent;
    case 'rights.turnover': return getNode(state, id).turnover * percent;
    case 'pools.revenu': return state.pools[id].revenu * percent;
    case 'pools.turnover': return state.pools[id].turnover * percent;
    case 'investment': return state.investment * percent;
    case 'expense': return (state.expense[id] ?? 0) * percent;
  }
}

interface OrgRevenuCondition {
  orgId: string;
  target: TargetValue;
  operator: NumberOperator;
}
function orgRevenu(ctx: ConditionContext, payload: OrgRevenuCondition) {
  const { state } = ctx;
  const { orgId, target, operator } = payload;
  const org = state.orgs[orgId];
  const targetValue = toTargetValue(state, target);
  return numericOperator(operator, org.revenu, targetValue);
}
function orgTurnover(ctx: ConditionContext, payload: OrgRevenuCondition) {
  const { state } = ctx;
  const { orgId, target, operator } = payload;
  const org = state.orgs[orgId];
  const targetValue = toTargetValue(state, target);
  return numericOperator(operator, org.turnover, targetValue);
}

interface PoolCondition {
  pool: string;
  target: TargetValue;
  operator: NumberOperator;
}
function poolRevenu(ctx: ConditionContext, payload: PoolCondition) {
  const { state } = ctx;
  const { target, operator, pool } = payload;
  const currentValue = state.pools[pool]?.revenu ?? 0;
  const targetValue = toTargetValue(state, target);
  return numericOperator(operator, currentValue, targetValue);
}
function poolTurnover(ctx: ConditionContext, payload: PoolCondition) {
  const { state } = ctx;
  const { target, operator, pool } = payload;
  const currentValue = state.pools[pool]?.turnover ?? 0;
  const targetValue = toTargetValue(state, target);
  return numericOperator(operator, currentValue, targetValue);
}
interface RightCondition {
  rightId: string;
  target: TargetValue;
  operator: NumberOperator;
}
function rightRevenu(ctx: ConditionContext, payload: RightCondition) {
  const { state } = ctx;
  const { rightId, target, operator } = payload;
  assertNode(state, rightId);
  const right = getNode(state, rightId);
  const targetValue = toTargetValue(state, target);
  return numericOperator(operator, right.revenu, targetValue);
}
function rightTurnover(ctx: ConditionContext, payload: RightCondition) {
  const { state } = ctx;
  const { rightId, target, operator } = payload;
  assertNode(state, rightId);
  const right = getNode(state, rightId);
  const targetValue = toTargetValue(state, target);
  return numericOperator(operator, right.turnover, targetValue);
}

interface GroupCondition {
  groupId: string;
  target: TargetValue;
  operator: NumberOperator;
}
function groupRevenu(ctx: ConditionContext, payload: GroupCondition) {
  const { state } = ctx;
  const { groupId, target, operator } = payload;
  assertNode(state, groupId);
  const right = getNode(state, groupId);
  const targetValue = toTargetValue(state, target);
  return numericOperator(operator, right.revenu, targetValue);
}
function groupTurnover(ctx: ConditionContext, payload: GroupCondition) {
  const { state } = ctx;
  const { groupId, target, operator } = payload;
  assertNode(state, groupId);
  const right = getNode(state, groupId);
  const targetValue = toTargetValue(state, target);
  return numericOperator(operator, right.turnover, targetValue);
}

///////////
// EVENT //
///////////

interface EventCondition {
  eventId: string;
  value: unknown;
  operator: NumberOperator | ArrayOperator;
}

function assertNumber(value: unknown, eventId?: string): asserts value is number {
  if (typeof value !== 'number') {
    const current = `Got "${JSON.stringify(value)}" instead`;
    if (eventId) {
      throw `The value of the event "${eventId}" sould have been a number. ${current}`;
    } else {
      throw `Value provided to compare with the event ${eventId} should have been a array. ${current}`;
    }
  }
}
function assertArray(value: unknown, eventId?: string): asserts value is Array<unknown> {
  if (Array.isArray(value)) {
    const current = `Got "${JSON.stringify(value)}" instead`;
    if (eventId) {
      throw `The value of the event "${eventId}" sould have been an array. ${current}`;
    } else {
      throw `Value provided to compare with the event ${eventId} should have been an array. ${current}`;
    }
  }
}

function event(ctx: ConditionContext, payload: EventCondition) {
  const { state } = ctx;
  const { eventId, value, operator } = payload;

  const event = state.events[eventId];
  if (!event) return false; // Event did not happen yet
  switch (operator) {
    case '==': return event == value;
    case '!=': return event != value;
    case '<': {
      assertNumber(value);
      assertNumber(event, eventId);
      return event < value;
    }
    case '>=': {
      assertNumber(value);
      assertNumber(event, eventId);
      return event >= value;
    }
    case 'in': {
      assertArray(value);
      return value.includes(event);
    }
    case 'not-in': {
      assertArray(value);
      return !value.includes(event);
    }
  }
}


//////////////
// DURATION //
//////////////

interface ConditionDuration {
  from?: Date;
  to?: Date;
}
function incomeDate(ctx: ConditionContext, payload: ConditionDuration) {
  const { income } = ctx;
  const { from, to } = payload;
  const date = income.date;
  if (!date) throw new Error(`Income "${income.id}" do not have a date.`);
  if (from && to) return (date >= from && date <= to);
  if (from) return date >= from;
  if (to) return date <= to;
  throw new Error("Income date condititon should have either from or/and to. But none were provided");
}

function contractDate(ctx: ConditionContext, payload: ConditionDuration) {
  const { income, right } = ctx;
  const { from, to } = payload;
  const contractId = income.contractId;
  if (!contractId) throw new Error(`Right "${right.id}" as condition on contract Date, but income "${income.id}" do not provide a contractId`);
  if (!ctx.state.contracts[contractId]) throw new Error(`Contract "${contractId} not found in state`);

  const { start, end } = ctx.state.contracts[contractId];
  if (!start || !end) throw new Error(`Contract "${contractId}" does not specify valid start and end dates`);

  if (from && to) return (start >= from && end <= to);
  if (from) return start >= from;
  if (to) return end <= to;

  throw new Error("Income date condititon should have either from or/and to. But none were provided");
}

///////////////////
// INCOME AMOUNT //
///////////////////

interface ConditionAmount {
  operator: NumberOperator;
  target: number;
}
function amount(ctx: ConditionContext, payload: ConditionAmount) {
  const { income } = ctx;
  const { operator, target } = payload;
  return numericOperator(operator, income.amount, target);
}


interface ConditionTerms {
  operator: ArrayOperator;
  type: 'territory' | 'media';
  list: string[];
}
function terms(ctx: ConditionContext, payload: ConditionTerms) {
  const { income } = ctx;
  const { operator, type, list } = payload;
  const hasItem = income[type]?.some((item) => list.includes(item));
  if (operator === 'in') return hasItem;
  if (operator === 'not-in') return !hasItem;
  throw new Error('Terms condition should have at least the operators "in" or "not-in"');
}


interface ConditionTermsLength {
  operator: NumberOperator;
  type: 'territory' | 'media';
  target: number;
}
function termsLength(ctx: ConditionContext, payload: ConditionTermsLength) {
  const { income } = ctx;
  const { operator, type, target } = payload;
  const terms = income[type];
  return numericOperator(operator, terms.length, target);
}

interface ConditionContract {
  operator: ArrayOperator;
  contractIds: string[];
}
/** Check if the income is or not from one of the contractId */
function contract(ctx: ConditionContext, payload: ConditionContract) {
  const { income } = ctx;
  const { operator, contractIds } = payload;
  const hasItem = contractIds.includes(income.contractId ?? '__');
  if (operator === 'in') return hasItem;
  if (operator === 'not-in') return !hasItem;
  throw new Error('Terms condition should have at least the operators "in" or "not-in"');
}

interface ConditionContractAmount {
  operator: NumberOperator;
  target: number;
}
function contractAmount(ctx: ConditionContext, payload: ConditionContractAmount) {
  const { income, right, state } = ctx;
  const { operator, target } = payload;
  const contractId = income.contractId;
  if (!contractId) throw new Error(`Right "${right.id}" have a condition on contract amount, but income "${income.id}" do not provide a contractId`);
  const current = ctx.state.contracts[contractId]?.amount;
  const targetValue = toTargetValue(state, target);
  return numericOperator(operator, current, targetValue);
}

//////////////
// INTEREST //
//////////////

interface ConditionInterest {
  orgId: string;
  rate: number;
  isComposite?: boolean;
}
function interest(ctx: ConditionContext, payload: ConditionInterest) {
  const { state } = ctx;
  const { orgId, rate, isComposite } = payload;
  const { revenu, operations } = state.orgs[orgId];
  return revenu >= investmentWithInterest(rate, operations, isComposite);
}