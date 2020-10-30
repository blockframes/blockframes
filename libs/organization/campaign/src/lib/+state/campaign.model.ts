import { MovieCurrency } from "@blockframes/utils/static-model"

export interface Campaign {
  id: string;
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
    financingPlan?: string;
    waterfall?: string;
    budget?: string;
  }
}


export interface Budget {
  castCost?: number,
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
  // @todo(#4116)
  // amount: {
  //   current: number,
  //   total: number
  // }
}

export function createCampaign(params: Partial<Campaign> = {}): Campaign {
  return {
    id: '',
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
    // @todo(#4116)
    // amount: {
    //   total: 0,
    //   current: 0,
    // },
    ...params
  }
}
