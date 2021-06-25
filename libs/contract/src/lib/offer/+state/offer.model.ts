import { MovieCurrency } from '@blockframes/utils/static-model';

export interface Offer {
  id: string;
  buyerId: string;
  buyerUserId: string;
  specificity: string;
  status: 'pending';
  currency: MovieCurrency;
  date: Date;
  delivery: string;
}
