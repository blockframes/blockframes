import { Media, Territory } from '../static';
import { Action, GroupChild, PaymentAction } from './action';
import { ConditionGroup, and } from './conditions';

export interface NodeState {
  id: string;
  turnover: AmountState;
  revenu: AmountState;
  percent: number;
  previous: string[];
}

export interface RightState extends NodeState {
  orgId: OrgState['id'];
  contractId?: ContractState['id'];
  enabled: boolean;
  conditions: ConditionGroup;
  pools: string[]
}

export interface GroupState extends NodeState {
  children: string[];
}

export type VerticalState = GroupState;

export interface HorizontalState extends GroupState {
  blameId: string;
}

interface CreateRight {
  id: RightState['id'];
  orgId: OrgState['id'];
  contractId?: ContractState['id'];
  percent: number;
  conditions?: ConditionGroup;
  previous?: string[];
  pools?: string[];
}

export function createRightState(right: CreateRight): RightState {
  const id = right.id ?? `right_${Math.round(Math.random() * 10000)}`;
  return {
    revenu: {
      calculated: 0,
      actual: 0
    },
    turnover: {
      calculated: 0,
      actual: 0
    },
    previous: [],
    conditions: and([]),
    pools: [],
    enabled: true,
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
    revenu: {
      calculated: 0,
      actual: 0
    },
    turnover: {
      calculated: 0,
      actual: 0
    },
    previous: previous ?? [],
    children: children.map(child => child.id),
    blameId: group.blameId
  }
}

export function createVertical(group: CreateVertical): VerticalState {
  const { id, children, previous, percent } = group;
  const childOrgs = Array.from(new Set(children.filter(c => c.type === 'right').map((c: any) => c.orgId)));
  if (childOrgs.length > 1) throw new Error(`Childrens of vertical group "${group.id}" must have the same organizations`);
  return {
    id,
    percent: percent ?? 1,
    revenu: {
      calculated: 0,
      actual: 0
    },
    turnover: {
      calculated: 0,
      actual: 0
    },
    previous: previous ?? [],
    children: children.map(child => child.id),
  }
}

export interface Operation {
  amount: number;
  type: OperationType;
  date: Date;
}

interface AmountState {
  calculated: number;
  actual: number;
}

export interface OrgState {
  id: string;
  turnover: AmountState;
  revenu: AmountState;
  investment: number;
  bonus: number;
  operations: Operation[];
}
export const createOrg = (org: Partial<OrgState>): OrgState => ({
  id: `org_${Math.round(Math.random() * 10000)}`,
  turnover: {
    calculated: 0,
    actual: 0
  },
  revenu: {
    calculated: 0,
    actual: 0
  },
  investment: 0,
  bonus: 0,
  operations: [],
  ...org
});

export interface PoolState {
  id: string;
  revenu: AmountState;
  turnover: AmountState;
  shadowRevenu: number;
}

export const createPoolState = (pool: Partial<PoolState>): PoolState => ({
  id: '',
  turnover: {
    calculated: 0,
    actual: 0
  },
  revenu: {
    calculated: 0,
    actual: 0
  },
  shadowRevenu: 0,
  ...pool
});

export interface IncomeState {
  id: string;
  date?: Date; // TODO #9336 : once fixtures are removed, this should be required (remove "?")
  from?: string; // TODO #9336 : once fixtures are removed, this should be required (remove "?")
  to: string;
  amount: number;
  territories: Territory[];
  medias: Media[];
  isCompensation?: boolean;
  contractId?: string;
}

export interface ExpenseState {
  id: string;
  orgId: string;
  date: Date;
  amount: number;
  typeId: string;
  capped: boolean;
}
export function createExpenseState(expense: Partial<ExpenseState> & { id: string }): ExpenseState {
  return {
    orgId: '',
    date: new Date(),
    typeId: '',
    amount: 0,
    capped: false,
    ...expense
  }
}

interface ExpenseTypeState {
  id: string;
  name: string;
  cap: number;
}
export function createExpenseTypeState(expense: Partial<ExpenseTypeState> & { id: string }): ExpenseTypeState {
  return {
    name: '',
    cap: 0,
    ...expense
  }
}

type PaymentState = PaymentAction;

export interface ContractState {
  id: string;
  date?: Date; // Signature date
  amount: number;
  paid: number;
  start?: Date;
  end?: Date;
}
export function createContractState(contract: Partial<ContractState> & { id: string }): ContractState {
  return {
    amount: 0,
    paid: 0,
    ...contract
  }
}

export interface SourceState {
  id: string;
  amount: number;
  destinationId: string;
  incomeIds: string[];
}

export function createSourceState(source: Partial<SourceState>): SourceState {
  return {
    id: '',
    amount: 0,
    destinationId: '',
    incomeIds: [],
    ...source,
  }
}

export interface TransferState {
  /** from->to */
  id: `${string}->${string}`;
  from: string;
  to: string;
  amount: number;
  history: {
    /** The income source */
    incomeId: string;
    /** The amount transfered */
    amount: number;
    /** Was the conditions valid for transfer */
    checked: boolean;
    /** Percent that "to" taken from "amount" (this allow percentage history if right is updated) */
    percent: number;
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
  expenseTypes: {
    [id: string]: ExpenseTypeState;
  }
  declarations: {
    [key: `${string}->${string}`]: number;
  },
  transfers: {
    [transferId: `${string}->${string}`]: TransferState;
  };
  incomes: {
    [id: string]: IncomeState;
  }
  expenses: {
    [id: string]: ExpenseState;
  }
  contracts: {
    [id: string]: ContractState;
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
  bonuses: Record<`${IncomeState['id']}-${VerticalState['id']}`, BonusState>,
  sources: {
    [sourceId: string]: SourceState
  },
  payments: {
    [id: string]: PaymentState;
  }
}

export interface History extends TitleState {
  actions: Action[];
  name: string;
}

export const createTitleState = (id: string): TitleState => ({
  id,
  date: new Date(0), // 1970: will be updated by the actions
  expenseTypes: {},
  investment: 0,
  declarations: {},
  transfers: {},
  incomes: {},
  expenses: {},
  contracts: {},
  events: {},
  onEvents: {},
  orgs: {},
  rights: {},
  horizontals: {},
  verticals: {},
  pools: {},
  bonuses: {},
  sources: {},
  payments: {},
});

