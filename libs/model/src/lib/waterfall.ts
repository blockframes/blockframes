export type Action = Record<string, unknown>; // TODO #9257 update with poc-waterfall model

type Role = 'productor' | 'coProductor' | 'distributor' | 'salesAgent' | 'financier'; // TODO #9257 define & move to static-models

export interface WaterfallPermissions {
  id: string; // orgId
  // #9254 If not movie owner, define the orgIds visible in the waterfall by the current org
  scope: string[];
  // Roles will define what can org do on waterfall/blocks/actions/...
  roles: Role[]
}

export interface Waterfall {
  id: string;
  versions: Record<string, string[]>;
  orgIds: string[]; // Orgs linked to waterfall, can read document if in it
}

export interface Block {
  id: string;
  timestamp: number;
  name: string;
  actions: Record<number, Action>
}

export interface WaterfallBudget {
  id: string; // Waterfall Id
}

// TODO #9257 merge into WaterfallBudget ?
export interface WaterfallFinancingPlan {
  id: string; // Waterfall Id
}