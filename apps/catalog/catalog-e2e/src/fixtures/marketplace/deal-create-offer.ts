import { fakeUserData } from '@blockframes/testing/cypress/browser';
import {
  createMovie,
  createDocPermissions,
  createPermissions,
  createMovieAppConfig,
  createAppConfig,
  createTitle,
  createUser,
  createOrganization,
  createOrgAppAccess,
  fakeLegalTerms,
  createMandate,
  createTerm,
  territoriesGroup,
  Territory,
} from '@blockframes/model';
import { centralOrgId } from '@env';
import { startOfYear, add, endOfMonth } from 'date-fns';

//* buyer data */

const buyerAdminUid = '0-e2e-buyerOrgAdminUid';
const buyerOrgId = '0-e2e-buyerOrgId';
const buyerData = fakeUserData();

const buyerUser = createUser({
  uid: buyerAdminUid,
  firstName: buyerData.firstName,
  lastName: buyerData.lastName,
  email: buyerData.email,
  orgId: buyerOrgId,
  termsAndConditions: {
    catalog: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
});

const buyerOrg = createOrganization({
  id: buyerOrgId,
  name: buyerData.company.name,
  userIds: [buyerAdminUid],
  email: buyerData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ catalog: { marketplace: true, dashboard: false } }),
});

const buyerOrgPermissions = createPermissions({
  id: buyerOrgId,
  roles: { [buyerAdminUid]: 'superAdmin' },
});

export const buyer = {
  user: buyerUser,
  org: buyerOrg,
  orgPermissions: buyerOrgPermissions,
};

//* seller data */

const sellerAdminUid = '0-e2e-sellerOrgAdminUid';
const sellerOrgId = '0-e2e-sellerOrgId';
const sellerMovieId = '0-e2e-sellerMovieId';
const sellerContractId = '0-e2e-sellerContractId';
const sellertermId = '0-e2e-sellertermId';
const sellerData = fakeUserData();

const sellerUser = createUser({
  uid: sellerAdminUid,
  firstName: sellerData.firstName,
  lastName: sellerData.lastName,
  email: sellerData.email,
  orgId: sellerOrgId,
  termsAndConditions: {
    catalog: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
});

const sellerOrg = createOrganization({
  id: sellerOrgId,
  name: sellerData.company.name,
  userIds: [sellerAdminUid],
  email: sellerData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ catalog: { marketplace: true, dashboard: true } }),
});

const sellerOrgPermissions = createPermissions({
  id: sellerOrgId,
  roles: { [sellerAdminUid]: 'superAdmin' },
});

const sellerMoviePermissions = createDocPermissions({
  id: sellerMovieId,
  ownerId: sellerOrgId,
});

const sellerAcceptedMovie = createMovie({
  id: sellerMovieId,
  orgIds: [sellerOrgId],
  app: createMovieAppConfig({
    catalog: createAppConfig({ status: 'accepted', access: true }),
  }),
  //main
  productionStatus: 'released',
  title: createTitle({
    original: 'Original title',
    international: 'International title',
  }),
});

const sellerContract = createMandate({
  id: sellerContractId,
  titleId: sellerMovieId,
  sellerId: sellerOrgId,
  termIds: [sellertermId],
  stakeholders: [centralOrgId.catalog, sellerOrgId],
  buyerId: centralOrgId.catalog,
  status: 'accepted',
});

const nextJanuaryFirst = startOfYear(add(new Date(), { years: 1 }));

const sellerTerm = createTerm({
  id: sellertermId,
  contractId: sellerContractId,
  duration: {
    from: nextJanuaryFirst,
    to: endOfMonth(add(nextJanuaryFirst, { months: 5 })), //June 30th of next year
  },
  licensedOriginal: true,
  medias: ['payTv', 'freeTv', 'payPerView', 'rental', 'festival'],
  territories: [
    //all territories in Europe and Latin America, plus Nepal = 69 countries
    territoriesGroup.map(group => (group.label === 'Europe' || group.label === 'Latin America') && group.items).filter(Boolean),
    'nepal',
  ].flat(2) as Territory[],
  languages: {
    english: { dubbed: true, subtitle: false, caption: false },
    french: { dubbed: false, subtitle: true, caption: false },
  },
});

export const seller = {
  user: sellerUser,
  org: sellerOrg,
  orgPermissions: sellerOrgPermissions,
  movie: sellerAcceptedMovie,
  moviePermissions: sellerMoviePermissions,
  contract: sellerContract,
  term: sellerTerm,
};
