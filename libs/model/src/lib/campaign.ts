import { StorageFile } from './media';
import { MovieCurrency } from './static';

export interface Campaign {
  id: string;
  orgId: string;
  currency: MovieCurrency;
  cap?: number;
  minPledge?: number;
  received?: number;
  perks: Perk[];
  fundings: Funding[];
  profits: {
    low?: number,
    medium?: number,
    high?: number
  };
  budget?: Budget,
  files: {
    financingPlan?: StorageFile;
    waterfall?: StorageFile;
    budget?: StorageFile;
  }
}


export interface Budget {
  development?: number,
  shooting?: number,
  postProduction?: number,
  administration?: number,
  contingency?: number,
}

export interface Funding {
  name?: string;
  amount?: number;
  kind?: string;
  status?: 'estimated' | 'confirmed';
}

export interface Perk {
  title: string,
  description: string,
  minPledge: number,
  amount: {
    current: number,
    total: number
  }
}

export function createCampaign(params: Partial<Campaign> = {}): Campaign {
  return {
    id: '',
    orgId: '',
    currency: 'USD',
    perks: [],
    fundings: [],
    profits: {},
    files: {},
    ...params
  }
}

export function createPerk(params: Partial<Perk> = {}): Perk {
  return {
    title: '',
    description: '',
    minPledge: 0,
    amount: {
      total: 0,
      current: 0,
    },
    ...params
  }
}
