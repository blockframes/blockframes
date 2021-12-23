import { DocumentMeta } from '@blockframes/utils/models-meta';
import { MovieCurrency, StaticModel } from '@blockframes/utils/static-model';

export type OfferStatus = keyof StaticModel['offerStatus'];

export interface Offer {
  id: string;
  buyerId: string;
  buyerUserId: string;
  specificity: string;
  status: OfferStatus;
  currency: MovieCurrency;
  _meta: DocumentMeta<Date>;
  delivery: string;
}
