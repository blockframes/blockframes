import {
  createBucket,
  createDocumentMeta,
  createSale,
  Offer,
  Negotiation,
  Media,
  Territory,
  territoriesGroup,
} from '@blockframes/model';
import { centralOrgId } from '@env';
import { buyer, seller } from './deal-create-offer';
import { add, sub } from 'date-fns';

const offerId = '0-e2e-offerId';
const saleContractId = '0-e2e-saleContractId';
const negotiationId = '0-e2e-negotitationId';

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

const bucketTermMedias: Media[] = Array(48).fill(['payTv', 'freeTv', 'payPerView']).flat();
const europeCountries = territoriesGroup.map(group => group.label === 'Europe' && group.items).flat();
const bucketTermTerritories: Territory[] = europeCountries
  .map(country => Array(3).fill(country))
  .flat()
  .filter(Boolean);

const negotiation: Negotiation = {
  _meta: createDocumentMeta({}),
  id: negotiationId,
  buyerId: buyer.org.id,
  createdByOrg: buyer.org.id,
  currency: 'EUR',
  initial: new Date(),
  orgId: seller.org.id,
  parentTermId: seller.term.id,
  price: 10000,
  sellerId: centralOrgId.catalog,
  specificity: offer.specificity,
  stakeholders: saleContract.stakeholders,
  status: 'pending',
  titleId: seller.movie.id,
  terms: [
    {
      territories: bucketTermTerritories,
      medias: bucketTermMedias,
      exclusive: false,
      duration: {
        from: add(seller.term.duration.from, { months: 1 }),
        to: sub(seller.term.duration.to, { months: 1 }),
      },
      languages: {},
    },
  ],
  holdbacks: [],
};

const bucket = createBucket({
  id: buyer.user.uid,
  currency: 'EUR',
  specificity: offer.specificity,
});

export { buyer, seller, offer, saleContract, negotiation, bucket };
