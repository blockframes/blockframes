import { TerritoriesSlug, LanguagesSlug, MediasSlug } from '@blockframes/utils/static-model';
import { MovieLanguageSpecification } from '@blockframes/movie/movie/+state/movie.firestore';
import { TermsRaw } from '@blockframes/utils/common-interfaces/terms';
import { firestore } from 'firebase';

type Timestamp = firestore.Timestamp;

export const enum LicenseStatus {
  unknown = 'unknown',
  undernegotiation = 'under negotiation',
  waitingsignature = 'waiting for signature',
  waitingpayment = 'waiting for paiment',
  paid = 'paid'
}

export interface HoldbackRaw<D> {
  terms: TermsRaw<D>;
  media: MediasSlug;
}

export enum DistributionDealStatus {
 
  /** 
   * @dev first status of a deal 
   * Starting from this status, the deal is visible by creator only
   */
  draft = 'Draft',

    /** 
   * @dev first status of a deal 
   * Starting from this status, the deal is visible by creator only
   */
  cart = 'In cart',

  /** 
   * @dev the deal have been sold
   */
  sold = 'Sold',
  /** 
   * @dev in this status, a contract should exists regarding this distribution deal.
   * When Contract status changes, this could chance too
   */
  undernegotiation = 'Under negotiation',
}

export interface HoldbackWithDates extends HoldbackRaw<Date> {}

// Distribution deal raw interface, formerly called MovieSaleRaw
interface DistributionDealRaw<D> {
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
  deliveryIds?: string;
  multidiffusion?: TermsRaw<D>[];
  holdbacks?: HoldbackRaw<D>[];
  catchUp?: TermsRaw<D>;
  status: DistributionDealStatus,
}

export interface DistributionDealDocumentWithDates extends DistributionDealRaw<Date> {}

export interface DistributionDealDocument extends DistributionDealRaw<Timestamp> {}

