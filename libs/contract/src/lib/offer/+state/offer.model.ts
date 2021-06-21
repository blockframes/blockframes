export interface Offer {
  id: string;
  buyerId: string;
  buyerUserId: string;
  specificity: string;
  status: 'pending' | 'negociating' | 'accepted' | 'signing' | 'signed' | 'declined';
  date: Date;
  delivery: string;
}
