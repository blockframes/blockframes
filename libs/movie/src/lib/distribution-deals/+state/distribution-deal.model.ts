import {
  DistributionDealDocumentWithDates as DistributionDeal,
  HoldbackWithDates as Holdback,
} from './distribution-deal.firestore';
import { createTerms } from '@blockframes/utils/common-interfaces/terms';

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
