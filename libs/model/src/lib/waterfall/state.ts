import { Action, GroupChild } from './action';
import { ConditionGroup, or } from './conditions';

export interface NodeState {
  id: string;
  turnover: number;
  revenu: number;
  percent: number;
  previous: string[];
}

export interface RightState extends NodeState {
  orgId: OrgState['id'];
  // Todo: add duration
  conditions: ConditionGroup;
  pools: string[]
}

interface GroupState extends NodeState {
  children: string[];
}

export type VerticalState = GroupState;

export interface HorizontalState extends GroupState {
  blameId: string;
}

interface CreateRight {
  id: RightState['id'];
  orgId: OrgState['id'];
  percent: number;
  conditions?: ConditionGroup;
  previous?: string[];
  pools?: string[];
}

export function createRightState(right: CreateRight): RightState {
  const id = right.id ?? `right_${Math.round(Math.random() * 10000)}`;
  return {
    revenu: 0,
    turnover: 0,
    previous: [],
    conditions: or([]),
    pools: [],
    ...right,
    id,
  }
}

export type OperationType = 'income' | 'investment';
interface CreateGroup {
  id: string;
  children: GroupChild[];
  previous?: string[];
  percent?: number;
}

type CreateVertical = CreateGroup;

interface CreateHorizontal extends CreateGroup {
  blameId: string;
}

export function createHorizontal(group: CreateHorizontal): HorizontalState {
  const { id, children, previous, percent } = group;
  return {
    id,
    percent: percent ?? 1,
    revenu: 0,
    turnover: 0,
    previous: previous ?? [],
    children: children.map(child => child.id),
    blameId: group.blameId
  }
}

export function createVertical(group: CreateVertical): VerticalState {
  const { id, children, previous, percent } = group;
  return {
    id,
    percent: percent ?? 1,
    revenu: 0,
    turnover: 0,
    previous: previous ?? [],
    children: children.map(child => child.id),
  }
}

export interface Operation {
  amount: number;
  type: OperationType;
  date: Date;
}

export interface OrgState {
  id: string;
  turnover: number;
  revenu: number;
  investment: number;
  expense: number;
  bonus: number;
  operations: Operation[];
}
export const createOrg = (org: Partial<OrgState>): OrgState => ({
  id: `org_${Math.round(Math.random() * 10000)}`,
  turnover: 0,
  revenu: 0,
  investment: 0,
  bonus: 0,
  expense: 0,
  operations: [],
  ...org
})

interface PoolState {
  revenu: number;
  turnover: number;
  shadowRevenu: number;
}

interface IncomeState {
  id: string;
  date?: Date;
  from?: string;
  to: string;
  amount: number;
  territory: string[];
  media: string[];
  isCompensation?: boolean;
  contractId?: string;
}

interface ContratState {
  id: string;
  date?: Date; // Signature date
  amount: number;
  paid: number;
  start?: Date;
  end?: Date;
}
export function createContractState(contract: Partial<ContratState> & { id: string }) {
  return {
    amount: 0,
    paid: 0,
    ...contract
  }
}

export interface TransferState {
  /** from->to */
  id: `${string}->${string}`;
  from?: string;
  to: string;
  amount: number;
  history: {
    /** The income source */
    incomeId: string;
    /** The amount transfered */
    amount: number;
  }[];
}
export function createTransfer(id: `${string}->${string}`): TransferState {
  const [from, to] = id.split('->');
  return {
    id,
    from,
    to,
    amount: 0,
    history: [],
  }
}

export interface BonusState {
  amount: number;
  groupId: string;
  incomeId: string;
  orgId: string;
}

export const createBonus = (bonus: Partial<BonusState>): BonusState => ({
  amount: 0,
  incomeId: '',
  groupId: '',
  orgId: '',
  ...bonus
});

export interface TitleState {
  id: string;
  date: Date;
  investment: number;
  expense: Record<string, number>;
  declarations: {
    [key: `${string}->${string}`]: number;
  },
  transfers: {
    [transferId: `${string}->${string}`]: TransferState;
  };
  incomes: {
    [id: string]: IncomeState;
  }
  contracts: {
    [id: string]: ContratState;
  }
  events: {
    [eventId: string]: unknown;
  }
  onEvents: {
    [eventId: string]: Action[];
  }
  orgs: {
    [orgId: string]: OrgState;
  }
  horizontals: {
    [groupId: string]: HorizontalState;
  }
  verticals: {
    [groupId: string]: VerticalState;
  }
  rights: {
    [rightId: string]: RightState;
  }
  pools: {
    [poolId: string]: PoolState
  },
  bonuses: Record<`${IncomeState['id']}-${VerticalState['id']}`, BonusState>
}

export interface History extends TitleState {
  actions: Action[];
}

export const createTitleState = (id: string): TitleState => ({
  id,
  date: new Date(0), // 1970: will be updated by the actions
  expense: {},
  investment: 0,
  declarations: {},
  transfers: {},
  incomes: {},
  contracts: {},
  events: {},
  onEvents: {},
  orgs: {},
  rights: {},
  horizontals: {},
  verticals: {},
  pools: {},
  bonuses: {}
})
