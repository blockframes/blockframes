import { MovieCurrency } from "@blockframes/utils/static-model"

export interface Campaign {
  id: string;
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
    financingPlan?: string;
    waterfall?: string;
    budget?: string;
  }
}


export interface Budget {
  castCost?: number,
  currency?: MovieCurrency,
  others?: number,
  postProdCost?: number,
  producerFees?: number,
  shootCost?: number,
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
