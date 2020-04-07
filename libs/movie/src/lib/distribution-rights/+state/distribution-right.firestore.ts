import { TerritoriesSlug, LanguagesSlug, MediasSlug } from '@blockframes/utils/static-model';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { TermsRaw } from '@blockframes/utils/common-interfaces/terms';
import { firestore } from 'firebase/app';

type Timestamp = firestore.Timestamp;

export const licenseStatus = {
  unknown: 'unknown',
  undernegotiation: 'under negotiation',
  waitingsignature: 'waiting for signature',
  waitingpayment: 'waiting for paiment',
  paid: 'paid'
} as const;

export type LicenseStatus = keyof typeof licenseStatus;
export type LicenseStatusValue = typeof licenseStatus[LicenseStatus];

export interface HoldbackRaw<D> {
  terms: TermsRaw<D>;
  media: MediasSlug;
}

export const distributionRightStatus = {
  /**
   * @dev first status of a right
   * Starting from this status, the right is visible by creator only
   */
  draft: 'Draft',

  /**
   * @dev first status of a right
   * Starting from this status, the right is visible by creator only
   */
  cart: 'In cart',

  /**
   * @dev the right have been sold
   */
  sold: 'Sold',

  /**
   * @dev in this status, a contract should exists regarding this distribution right.
   * When Contract status changes, this could chance too
   */
  undernegotiation: 'Under negotiation',
} as const;

export type DistributionRightStatus = keyof typeof distributionRightStatus;
export type DistributionRightStatusValue = typeof distributionRightStatus[DistributionRightStatus];

export interface HoldbackWithDates extends HoldbackRaw<Date> { }

// Distribution right raw interface, formerly called MovieSaleRaw
interface DistributionRightRaw<D> {
  id: string,
  publicId?: string,
  licenseType: MediasSlug[];
  terms: TermsRaw<D>;
  territory: TerritoriesSlug[];
  territoryExcluded: TerritoriesSlug[];
  assetLanguage: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>;
  exclusive: boolean;
  titleInternalAlias: string;
  download: boolean;
  contractId?: string;
  multidiffusion?: TermsRaw<D>[];
  holdbacks?: HoldbackRaw<D>[];
  catchUp?: TermsRaw<D>;
  status: DistributionRightStatus,
}

export interface DistributionRightDocumentWithDates extends DistributionRightRaw<Date> { }

export interface DistributionRightDocument extends DistributionRightRaw<Timestamp> { }

