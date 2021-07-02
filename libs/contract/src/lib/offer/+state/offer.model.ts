import { MovieCurrency } from '@blockframes/utils/static-model';

export const offerStatus = [
  'pending',
  'negotiating',
  'accepted',
  'signing',
  'signed',
  'declined',
] as const;

export type OfferStatus = typeof offerStatus[number];
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
