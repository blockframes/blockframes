import {
  DistributionDealDocumentWithDates as DistributionDeal,
  HoldbackWithDates as Holdback,
  DistributionDealStatus
} from './distribution-deal.firestore';
import { createTerms, termToPrettyDate, formatTerms } from '@blockframes/utils/common-interfaces/terms';

export { DistributionDealDocumentWithDates as DistributionDeal } from './distribution-deal.firestore';

export function createDistributionDeal(params: Partial<DistributionDeal> = {}): DistributionDeal {
  return {
    id: '',
    licenseType: [],
    terms: createTerms(params.terms),
    territory: [],
    territoryExcluded: [],
    assetLanguage: {},
    exclusive: false,
    titleInternalAlias: '',
    download: false,
    holdbacks: [],
    multidiffusion: [],
    status: DistributionDealStatus.draft,
    catchUp: createTerms(params.catchUp),
    ...params
  };
}

export function createHoldback(params: Partial<Holdback> = {}): Holdback {
  return {
    terms: createTerms(params.terms),
    media: null,
    ...params
  };
}

/** Format deals dates from Timestamps into Dates. */
export function formatDistributionDeal(deal: any): DistributionDeal {
  return createDistributionDeal({
    ...deal,
    terms: formatTerms(deal.terms)
  })
}

/** Returns only eligible territories for a deal. */
export function getDealTerritories(deal: DistributionDeal): string[] {
  if (!deal.territory) {
    return [];
  }
  const territories = deal.territory;
  const excludedTerritories = deal.territoryExcluded;
  return territories.filter(territory => !excludedTerritories.includes(territory));
}

export interface DistributionDealWithMovieId {
  deal: DistributionDeal;
  movieId: string;
}

export function createDistributionDealWithMovieId(params: Partial<DistributionDealWithMovieId> = {}): DistributionDealWithMovieId {
  return {
    deal: createDistributionDeal(params.deal),
    movieId: params.movieId,
    ...params
  };
}
