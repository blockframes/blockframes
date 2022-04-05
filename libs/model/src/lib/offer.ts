import { MovieCurrency, OfferStatus } from './static';
import { DocumentMeta } from './meta';

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
