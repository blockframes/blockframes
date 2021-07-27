import { DocumentMeta } from '@blockframes/utils/models-meta';
import { MovieCurrency, StaticModel } from '@blockframes/utils/static-model';

export interface Offer {
  id: string;
  buyerId: string;
  buyerUserId: string;
  specificity: string;
  status: keyof StaticModel['offerStatus'];
  currency: MovieCurrency;
  _meta: DocumentMeta<Date>;
  delivery: string;
}
