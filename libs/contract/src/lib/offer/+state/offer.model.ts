import { MovieCurrency } from '@blockframes/utils/static-model';

export type OfferStatus = 'pending' | 'negotiating' | 'accepted' | 'signing' | 'signed' | 'declined';

export interface Offer {
  id: string;
  buyerId: string;
  buyerUserId: string;
  specificity: string;
  status: OfferStatus;
  currency: MovieCurrency;
  date: Date;
  delivery: string;
}
