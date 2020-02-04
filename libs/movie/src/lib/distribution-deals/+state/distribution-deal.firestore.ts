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
}

export interface DistributionDealDocumentWithDates extends DistributionDealRaw<Date> {}

export interface DistributionDealDocument extends DistributionDealRaw<Timestamp> {}

