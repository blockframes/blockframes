import {
  DistributionDealDocumentWithDates as DistributionDeal,
  HoldbackWithDates as Holdback,
  DistributionDealStatus
} from './distribution-deal.firestore';
import { createTerms } from '@blockframes/utils/common-interfaces/terms';
import { toDate } from '@blockframes/utils/helpers';

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
export function formatDistributionDeal(deal: DistributionDeal): DistributionDeal {
  deal.terms.start = toDate(deal.terms.start);
  deal.terms.end = toDate(deal.terms.end);
  return deal as DistributionDeal;
}

/** Returns only eligible territories for a deal. */
export function getDealTerritories(deal: DistributionDeal): string[] {
  const territories = deal.territory;
  const excludedTerritories = deal.territoryExcluded;
  return territories.filter(territory => !excludedTerritories.includes(territory));
}
