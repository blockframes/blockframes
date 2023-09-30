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

export function offersToCrmOffers(
  offers: Offer[],
  contracts: Contract[],
  titles: Movie[],
  negotiations: (Negotiation & { contractId: string })[]
) {
  const crmOffers: CrmOffer[] = offers.map(o => {
    const offerContracts = contracts.filter(c => c.offerId === o.id);
    const crmOffer = {
      ...o,
      contracts: offerContracts.map(c => {
        const contract = {
          ...c,
          title: titles.find(t => t.id === c.titleId),
          negotiation: negotiations.find(n => n.contractId === c.id),
        };
        return contract;
      }),
    };
    return crmOffer;
  });
  return crmOffers;
}