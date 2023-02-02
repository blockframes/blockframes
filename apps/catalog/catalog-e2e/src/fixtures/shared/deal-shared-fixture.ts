import {
  createBucket,
  createDocumentMeta,
  createSale,
  Offer,
  Negotiation,
  Media,
  Territory,
  territoriesGroup,
  createDuration,
  createBucketTerm,
} from '@blockframes/model';
import { centralOrgId } from '@env';
import { buyer, seller } from '../marketplace/deal-create-offer';
import { add, sub } from 'date-fns';

const offerId = '0-e2e-offerId';
const saleContractId = '0-e2e-saleContractId';
const buyerNegotiationId = '0-e2e-buyerNegotitationId';
const sellerNegotiationId = '0-e2e-sellerNegotitationId';

seller.movie.release.year = new Date().getFullYear() as number;
seller.movie.directors = [
  {
    firstName: 'John',
    lastName: 'Doe',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
  },
];

const offer: Offer = {
  id: offerId,
  buyerId: buyer.org.id,
  buyerUserId: buyer.user.uid,
  currency: 'EUR',
  specificity: 'E2E Specific terms',
  status: 'pending',
  _meta: createDocumentMeta({}),
};

const saleContract = createSale({
  id: saleContractId,
  titleId: seller.movie.id,
  offerId: offer.id,
  parentTermId: seller.term.id,
  buyerId: buyer.org.id,
  buyerUserId: buyer.user.uid,
  specificity: offer.specificity,
  sellerId: centralOrgId.catalog,
  type: 'sale',
  status: 'pending',
  stakeholders: [centralOrgId.catalog, buyer.org.id, seller.org.id],
});

//below consts to be updated after fixing the multiple medias and countries issue (##9140 .4)
const bucketTermMedias: Media[] = Array(48).fill(['payTv', 'freeTv', 'payPerView']).flat();
const europeCountries = territoriesGroup
  .map(group => group.label === 'Europe' && group.items)
  .flat()
  .filter(Boolean);
const bucketTermTerritories: Territory[] = europeCountries.map(country => Array(3).fill(country)).flat();

const buyerNegotiation: Negotiation = {
  /** Moving this document in the past to avoid below issue :
   * if 'initial' from a new negotiation has the same hour and minute as 'createdAt', the document won't move to 'negotiating'
   * E2E tests being quick, it would happen a lot, making the test crash randomly
   */
  _meta: createDocumentMeta({ createdAt: sub(new Date(), { minutes: 2 }) }),
  id: buyerNegotiationId,
  buyerId: buyer.org.id,
  createdByOrg: buyer.org.id,
  currency: 'EUR',
  initial: sub(new Date(), { minutes: 2 }),
  orgId: seller.org.id,
  parentTermId: seller.term.id,
  price: 10000,
  sellerId: centralOrgId.catalog,
  specificity: offer.specificity,
  stakeholders: saleContract.stakeholders,
  status: 'pending',
  titleId: seller.movie.id,
  terms: [
    createBucketTerm({
      territories: bucketTermTerritories,
      medias: bucketTermMedias,
      exclusive: false,
      duration: createDuration({
        from: add(seller.term.duration.from, { months: 1 }),
        to: sub(seller.term.duration.to, { months: 1 }),
      }),
      languages: {},
    }),
  ],
  holdbacks: [],
};

const latinAmericaCountries = territoriesGroup
  .map(group => group.label === 'Latin America' && group.items)
  .flat()
  .filter(Boolean);

const sellerNegotiation: Negotiation = {
  _meta: createDocumentMeta({ createdAt: sub(new Date(), { minutes: 1 }) }),
  id: sellerNegotiationId,
  buyerId: buyer.org.id,
  createdByOrg: seller.org.id,
  currency: 'EUR',
  initial: sub(new Date(), { minutes: 1 }),
  orgId: seller.org.id,
  parentTermId: seller.term.id,
  price: 15000,
  sellerId: centralOrgId.catalog,
  stakeholders: saleContract.stakeholders,
  specificity: offer.specificity,
  status: 'pending',
  titleId: seller.movie.id,
  terms: [
    createBucketTerm({
      territories: europeCountries.concat(latinAmericaCountries),
      medias: ['payTv', 'payPerView'],
      exclusive: true,
      duration: createDuration({
        from: seller.term.duration.from,
        to: seller.term.duration.to,
      }),
      languages: { french: { caption: true, dubbed: true, subtitle: true } },
    }),
  ],
  holdbacks: [],
};

const bucket = createBucket({
  id: buyer.org.id,
  uid: buyer.user.uid,
  currency: 'EUR',
  specificity: offer.specificity,
});

export { buyer, seller, offer, saleContract, buyerNegotiation, sellerNegotiation, bucket };
