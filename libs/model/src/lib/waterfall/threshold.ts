import { IncomeAction as Income } from './action';
import { Condition, allConditions, checkCondition, thresholdConditions, splitConditions, toTargetValue } from './conditions';
import { investmentWithInterest } from './interest';
import { TitleState } from './state';
import { assertNode, getNode } from './node';

interface IncomeState {
  threshold: number;
  conditions: Condition[];
  groups: Record<string, {
    revenuRate: number;
    turnoverRate: number;
  }>;
  rights: Record<string, {
    revenuRate: number;
    shadowRevenuRate: number;
    turnoverRate: number;
  }>;
  orgs: Record<string, {
    revenuRate: number;
    turnoverRate: number;
  }>;
  pools: Record<string, {
    revenuRate: number;
    shadowRevenuRate: number;
    turnoverRate: number;
  }>;
  transfers: Record<`${string}->${string}`, number>;
  bonuses: Record<string, {
    bonusRate: number;
    groupId: string;
    orgId: string;
  }>
}

export function getMinThreshold(state: TitleState, payload: Income) {
  const incomeState: IncomeState = {
    threshold: payload.amount,
    conditions: [],
    groups: {},
    rights: {},
    orgs: {},
    pools: {},
    transfers: {},
    bonuses: {}
  };
  runThreshold(state, payload, incomeState, 1);
  const thresholds: number[] = [payload.amount];
  for (const condition of incomeState.conditions) {
    if (!(condition.name in incomeConditions)) {
      throw new Error(`Condition "${condition.name}" is not a numerical condition`);
    }
    const cdt = incomeConditions[condition.name as NumericalCondition];
    const amount = cdt(incomeState, state, condition.payload as any);
    thresholds.push(amount);
  }
  incomeState.threshold = Math.min(...thresholds, payload.amount);
  return incomeState;
}

function runThreshold(state: TitleState, payload: Income, incomeState: IncomeState, basePercent: number) {
  const { from, to } = payload;
  if (from) {
    incomeState.transfers[`${from}->${to}`] ||= 0;
    incomeState.transfers[`${from}->${to}`] += basePercent;
  }
  let taken = 0;
  assertNode(state, to);
  if (state.rights[to]) {
    const right = state.rights[to];
    const { thresholdCdts } = splitConditions(right.conditions);
    // Update conditions
    incomeState.conditions.push(...thresholdCdts);
    // Update right
    const { checked, shadow } = checkCondition({ state, right, income: payload });
    const incomeRight = initRight(incomeState, to);
    incomeRight.turnoverRate += basePercent;
    incomeRight.revenuRate += checked ? (right.percent * basePercent) : 0;
    incomeRight.shadowRevenuRate += shadow ? (right.percent * basePercent) : 0;
    // Update org
    const incomeOrg = initOrg(incomeState, right.orgId);
    incomeOrg.revenuRate += incomeRight.revenuRate;
    if (!incomeOrg.turnoverRate) incomeOrg.turnoverRate = basePercent;
    // Update pools
    if (right.pools) {
      for (const pool of right.pools) {
        const incomePool = initPool(incomeState, pool);
        incomePool.revenuRate += incomeRight.revenuRate;
        incomePool.shadowRevenuRate += incomeRight.shadowRevenuRate;
        if (!incomePool.turnoverRate) incomePool.turnoverRate = basePercent;
      }
    }
    taken = incomeRight.revenuRate;
  } else if (state.horizontals[to]) {
    const group = state.horizontals[to];
    const groupRate = basePercent * group.percent;
    const incomeGroup = initGroup(incomeState, to);
    incomeGroup.turnoverRate += groupRate;
    // Update org
    const incomeOrg = initOrg(incomeState, group.blameId);
    if (!incomeOrg.turnoverRate) incomeOrg.turnoverRate = groupRate;
    // Run childrens
    for (const child of group.children) {
      // Get rid of "from" for a better outcome on the graph with the transfers
      const income = { ...payload, to: child, from: undefined };
      taken += runThreshold(state, income, incomeState, groupRate);
    }
    incomeGroup.revenuRate += taken;

    if (groupRate < taken) {
      const blameId = group.blameId;
      const bonus = initBonus(incomeState, to, blameId);
      bonus.bonusRate += groupRate - taken;
    }
  } else if (state.verticals[to]) {
    const group = state.verticals[to];
    const groupRate = basePercent * group.percent;
    const incomeGroup = initGroup(incomeState, to);
    incomeGroup.turnoverRate += groupRate;
    for (const child of state.verticals[to].children) {
      // Get rid of "from" for a better outcome on the graph with the transfers
      const income = { ...payload, to: child, from: undefined };
      const groupTakes = runThreshold(state, income, incomeState, basePercent * group.percent);
      if (groupTakes) {
        taken += groupTakes;
        break;
      }
    }
    incomeGroup.revenuRate += taken;
  }
  const rest = basePercent - taken;
  // Continue
  if (rest > 0) {
    const node = getNode(state, to);
    for (const id of node.previous) {
      const income = { ...payload, to: id, from: to };
      runThreshold(state, income, incomeState, rest);
    }
  }
  return taken;
}

function initRight(incomeState: IncomeState, rightId: string) {
  return incomeState.rights[rightId] ||= { revenuRate: 0, turnoverRate: 0, shadowRevenuRate: 0 };
}

function initOrg(incomeState: IncomeState, orgId: string) {
  return incomeState.orgs[orgId] ||= { revenuRate: 0, turnoverRate: 0 };
}

function initPool(incomeState: IncomeState, poolName: string) {
  return incomeState.pools[poolName] ||= { revenuRate: 0, turnoverRate: 0, shadowRevenuRate: 0 };
}

function initGroup(incomeState: IncomeState, groupId: string) {
  return incomeState.groups[groupId] ||= { revenuRate: 0, turnoverRate: 0 };
}

function initBonus(incomeState: IncomeState, groupId: string, orgId: string) {
  return incomeState.bonuses[groupId] ||= { bonusRate: 0, groupId, orgId };
}

type AllConditions = typeof allConditions;
type NumericalCondition = keyof typeof thresholdConditions;
type IncomeCondition<T extends keyof AllConditions> = (incomeState: IncomeState, state: TitleState, condition: Parameters<AllConditions[T]>[1]) => number;
type AllIncomeConditions = {
  [key in NumericalCondition]: IncomeCondition<key>
}


const incomeConditions: AllIncomeConditions = {
  orgRevenu(incomeState, state, condition) {
    const { orgId, target } = condition;
    if (!incomeState.orgs[orgId]) return Infinity;  // condition is not affected by income
    const revenuRate = incomeState.orgs[orgId].revenuRate;
    const current = state.orgs[orgId].revenu.calculated;
    const value = toTargetValue(state, target);
    if (current >= value) return Infinity;
    return (value - current) / revenuRate;
  },
  orgTurnover(incomeState, state, condition) {
    const { orgId, target } = condition;
    if (!incomeState.orgs[orgId]) return Infinity;
    const turnoverRate = incomeState.orgs[orgId].turnoverRate;
    const current = state.orgs[orgId].turnover.calculated;
    const value = toTargetValue(state, target);
    if (current >= value) return Infinity;
    return (value - current) / turnoverRate;
  },
  poolRevenu(incomeState, state, condition) {
    const { pool, target } = condition;
    if (!incomeState.pools[pool]) return Infinity;
    const revenuRate = incomeState.pools[pool].revenuRate;
    const current = state.pools[pool]?.revenu.calculated ?? 0;
    const value = toTargetValue(state, target);
    if (current >= value) return Infinity;
    return (value - current) / revenuRate;
  },
  poolShadowRevenu(incomeState, state, condition) {
    const { pool, target } = condition;
    if (!incomeState.pools[pool]) return Infinity;
    const shadowRevenuRate = incomeState.pools[pool].shadowRevenuRate;
    const current = state.pools[pool]?.shadowRevenu ?? 0;
    const value = toTargetValue(state, target);
    if (current >= value) return Infinity;
    return (value - current) / shadowRevenuRate;
  },
  poolTurnover(incomeState, state, condition) {
    const { pool, target } = condition;
    if (!incomeState.pools[pool]) return Infinity;
    const turnoverRate = incomeState.pools[pool].turnoverRate;
    const current = state.pools[pool]?.turnover.calculated ?? 0;
    const value = toTargetValue(state, target);
    if (current >= value) return Infinity;
    return (value - current) / turnoverRate;
  },
  rightRevenu(incomeState, state, condition) {
    const { rightId, target } = condition;
    if (!incomeState.rights[rightId]) return Infinity;
    const revenuRate = incomeState.rights[rightId].revenuRate;
    const current = state.rights[rightId].revenu.calculated;
    const value = toTargetValue(state, target);
    if (current >= value) return Infinity;
    return (value - current) / revenuRate;
  },
  rightTurnover(incomeState, state, condition) {
    const { rightId, target } = condition;
    if (!incomeState.rights[rightId]) return Infinity;
    const turnoverRate = incomeState.rights[rightId].turnoverRate;
    const current = state.rights[rightId].turnover.calculated;
    const value = toTargetValue(state, target);
    if (current >= value) return Infinity;
    return (value - current) / turnoverRate;
  },
  groupRevenu(incomeState, state, condition) {
    const { groupId, target } = condition;
    if (!incomeState.groups[groupId]) return Infinity;
    const revenuRate = incomeState.groups[groupId].revenuRate;
    const current = getNode(state, groupId).revenu.calculated;
    const value = toTargetValue(state, target);
    if (current >= value) return Infinity;
    return (value - current) / revenuRate;
  },
  groupTurnover(incomeState, state, condition) {
    const { groupId, target } = condition;
    if (!incomeState.groups[groupId]) return Infinity;
    const turnoverRate = incomeState.groups[groupId].turnoverRate;
    const current = getNode(state, groupId).turnover.calculated;
    const value = toTargetValue(state, target);
    if (current >= value) return Infinity;
    return (value - current) / turnoverRate;
  },
  interest(incomeState, state, condition) {
    const { orgId, rate, isComposite } = condition;
    const revenuRate = incomeState.orgs[orgId].revenuRate;
    const current = state.orgs[orgId].revenu.calculated;
    const operations = state.orgs[orgId].operations;
    const value = investmentWithInterest(rate, operations, isComposite);
    if (current >= value) return Infinity;
    return (value - current) / revenuRate;
  }
}