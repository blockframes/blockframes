import {
  DistributionDealDocumentWithDates as DistributionDeal,
  HoldbackWithDates as Holdback,
  LicenseStatus,
  FormatProfile
} from './distribution-deal.firestore';
import { createTerms } from '@blockframes/utils/common-interfaces/terms';

export { DistributionDealDocumentWithDates as DistributionDeal } from './distribution-deal.firestore';

export function createDistributionDeal(params: Partial<DistributionDeal> = {}): DistributionDeal {
  return {
    id: '',
    licenseStatus: LicenseStatus.unknown,
    licenseType: [],
    terms: createTerms(params.terms),
    territory: [],
    territoryExcluded: [],
    assetLanguage: {},
    exclusive: false,
    titleInternalAlias: '',
    formatProfile: FormatProfile.unknown,
    download: false,
    holdbacks: [],
    catchUp: createTerms(params.catchUp),
    ...params
  };
}

export function createHoldback(params: Partial<Holdback> = {}): Holdback {
  return {
    terms: createTerms(params.terms),
    media: '',
    ...params
  };
}
