export type OfferStatus = 'pending' | 'negotiating' | 'accepted' | 'signing' | 'signed' | 'declined';
export interface Offer {
  id: string;
  buyerId: string;
  buyerUserId: string;
  specificity: string;
  status: OfferStatus;
  date: Date;
  delivery: string;
}
