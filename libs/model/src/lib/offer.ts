import { MovieCurrency, OfferStatus } from './static';
import { DocumentMeta } from './meta';
import { Contract } from './contract';
import { Movie } from './movie';
import { Negotiation } from './negociation';

export interface Offer {
  id: string;
  buyerId: string;
  buyerUserId: string;
  specificity: string;
  status: OfferStatus;
  currency: MovieCurrency;
  _meta: DocumentMeta;
}

export interface CrmOffer extends Offer {
  contracts: (Contract & { title: Movie; negotiation?: Negotiation })[];
}
