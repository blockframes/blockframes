export interface Campaign {
  id: string;
  cap?: number;
  minPledge?: number;
  received?: number;
  perks: Perk[];
  fundings: Funding[];
  profits: {
    low: number,
    middle: number,
    hight: number
  };
  financingPlan?: string;
  waterfall?: string;
  // budget
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
    profits: {
      low: 100,
      middle: 100,
      hight: 100
    },
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
