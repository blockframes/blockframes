export interface Campaign {
  id: string;
  cap?: number;
  minPledge?: number;
  received?: number;
  perks: Perk[];
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
