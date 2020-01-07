import { TerritoriesSlug, LanguagesSlug, MediasSlug } from '@blockframes/movie/static-model';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { TermsRaw } from '@blockframes/utils/common-interfaces/terms';
import { firestore } from 'firebase';

type Timestamp = firestore.Timestamp;

export const enum LicenseStatus {
  unknown = 'unknown',
  undernegotiation = 'under negotiation',
  waitingsignature = 'waiting for signature',
  waitingpaiment = 'waiting for paiment',
  paid = 'paid'
}

export const enum FormatProfile {
  unknown = 'unknown',
  HD = 'HD',
  SD = 'SD',
  UHD = 'UHD',
  _3D = '3D',
  _3DSD = '3DSD',
  _3DHD = '3DHD',
  _3UHD = '3DUHD'
}

// Distribution deal raw interface, formerly called MovieSaleRaw
interface DistributionDealRaw<D> {
  id: string;
  publicId?: string;
  licenseType: MediasSlug[];
  terms: TermsRaw<D>;
  territory: TerritoriesSlug[];
  territoryExcluded: TerritoriesSlug[];
  assetLanguage: { [language in LanguagesSlug]: MovieLanguageSpecification };
  exclusive: boolean;
  titleInternalAlias: string;
  formatProfile: FormatProfile;
  download: boolean;
  contractId?: string;
  licenseStatus: LicenseStatus;
  reportingId?: string;
  deliveryIds?: string;
  multidiffusion?: number;
  holdbacks?: HoldbackRaw<D>[];
  catchUp?: TermsRaw<D>;
}

export interface DistributionDealDocumentWithDates extends DistributionDealRaw<Date> {}

export interface DistributionDealDocument extends DistributionDealRaw<Timestamp> {}

export interface HoldbackRaw<D> {
  terms: TermsRaw<D>;
  media: MediasSlug;
}

export interface HoldbackWithDates extends HoldbackRaw<Date> {}
