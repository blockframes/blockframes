import {
  DistributionRightDocumentWithDates as DistributionRight,
  HoldbackWithDates as Holdback
} from './distribution-right.firestore';
import { createTerms, formatTerms } from '@blockframes/utils/common-interfaces/terms';
import { Optional } from '@blockframes/utils/common-interfaces/utility';

export { DistributionRightDocumentWithDates as DistributionRight } from './distribution-right.firestore';

export function createDistributionRight(params: Partial<DistributionRight> = {}): DistributionRight {
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
    status: 'draft',
    catchUp: createTerms(params.catchUp),
    ...params
  };
}

export function createHoldback(params: Partial<Holdback> = {}): Holdback {
  return {
    terms: createTerms(params.terms),
    ...params
  };
}

/** Format rights dates from Timestamps into Dates. */
export function formatDistributionRight(right: any): DistributionRight {
  return createDistributionRight({
    ...right,
    terms: formatTerms(right.terms)
  })
}

/** Returns only eligible territories for a right. */
export function getRightTerritories(right: DistributionRight): string[] {
  if (!right.territory) {
    return [];
  }
  const territories = right.territory;
  const excludedTerritories = right.territoryExcluded;
  return territories.filter(territory => !excludedTerritories.includes(territory));
}

export interface DistributionRightWithMovieId {
  right: DistributionRight;
  movieId: string;
}

export function createDistributionRightWithMovieId(params: Optional<DistributionRightWithMovieId, 'right'>): DistributionRightWithMovieId {
  return {
    right: createDistributionRight(params?.right),
    ...params
  };
}
