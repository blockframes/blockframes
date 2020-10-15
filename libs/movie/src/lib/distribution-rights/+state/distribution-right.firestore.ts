import { DistributionRightStatus, Language, MediaValue, Territory } from '@blockframes/utils/static-model';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { TermsRaw } from '@blockframes/utils/common-interfaces/terms';
import { firestore } from 'firebase/app';

type Timestamp = firestore.Timestamp;

export interface HoldbackRaw<D> {
  terms: TermsRaw<D>;
  media: MediaValue;
}

export interface HoldbackWithDates extends HoldbackRaw<Date> { }

// Distribution right raw interface, formerly called MovieSaleRaw
interface DistributionRightRaw<D> {
  id: string,
  publicId?: string,
  licenseType: MediaValue[];
  terms: TermsRaw<D>;
  territory: Territory[];
  territoryExcluded: Territory[];
  assetLanguage: Partial<{ [language in Language]: MovieLanguageSpecification }>;
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

