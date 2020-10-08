export interface Campaign {
  id: string;
  movieId: string;
  cap: number;
  minPledge: number;
  received: number;
  perks: Perk[];
}

export interface Perk {
  title: string,
  description?: string,
  minPledge?: number,
  amount: {
    current?: number,
    total: number
  }
}

export function createCampaign(params: Partial<Campaign> = {}): Campaign {
  return {
    id: '',
    movieId: '',
    cap: 0,
    minPledge: 0,
    received: 0,
    perks: [],
    ...params
  }
}

export function createPerk(params: Partial<Perk> = {}): Perk {
  return {
    title: '',
    minPledge: 0,
    amount: {
      total: 0,
      current: 0,
    },
    ...params
  }
}
