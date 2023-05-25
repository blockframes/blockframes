import { RightholderRole } from '../static';

export interface WaterfallPermissions {
  id: string; // orgId
  // #9254 If not movie owner, define the orgIds visible in the waterfall by the current org
  scope: string[];
  // Roles will define what can org do on waterfall/blocks/actions/...
  roles: RightholderRole[]
}

export function createWaterfallPermissions(params: Partial<WaterfallPermissions> = {}) : WaterfallPermissions {
  return {
    id: '',
    scope: [],
    roles: [],
    ...params,
  }
}

export interface Version {
  id: string;
  name: string;
  description?: string;
  blockIds: string[]
}

export function createVersion(params: Partial<Version> = {}) {
  const version: Version = {
    id: '',
    name: '',
    blockIds: [],
    ...params
  }

  if (!version.name) version.name = version.id;
  return version;
}

export interface Waterfall {
  id: string;
  versions: Version[]
  orgIds: string[]; // Orgs linked to waterfall, can read document if in it
}

export function createWaterfall(params: Partial<Waterfall> = {}): Waterfall {
  return {
    id: '',
    versions: [],
    orgIds: [],
    ...params,
  }
}

export interface WaterfallBudget {
  id: string; // Waterfall Id
}

// TODO #9257 merge into WaterfallBudget ?
export interface WaterfallFinancingPlan {
  id: string; // Waterfall Id
}
