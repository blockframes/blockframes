export interface Offer {
  id: string;
  buyerId: string;
  buyerUserId: string;
  specificity: string;
  status: 'pending';
  date: Date;
  delivery: string;
}
