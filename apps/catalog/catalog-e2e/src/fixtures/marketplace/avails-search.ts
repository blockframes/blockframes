import {
  createAppConfig,
  createDocPermissions,
  createMovie,
  createMandate,
  createMovieAppConfig,
  createOrganization,
  createOrgAppAccess,
  createPermissions,
  createTerm,
  createTitle,
  createUser,
  fakeLegalTerms,
  territoriesGroup,
} from '@blockframes/model';
import { add, startOfYear, endOfMonth } from 'date-fns';
import { fakeUserData } from '@blockframes/testing/cypress/browser';
import { centralOrgId } from '@env';

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

const buyer = {
  user: buyerUser,
  org: buyerOrg,
  orgPermissions: buyerOrgPermissions,
};

//* seller data */

const sellerAdminUid = '0-e2e-sellerOrgAdminUid';
const sellerOrgId = '0-e2e-sellerOrgId';
const sellerMovieId = '0-e2e-sellerMovieId';
const sellerContractId = '0-e2e-sellerContractId';
const sellerTerm1Id = '0-e2e-sellerTerm1Id';
const sellerTerm2Id = '0-e2e-sellerTerm2Id';
const sellerTerm3Id = '0-e2e-sellerTerm3Id';
const sellerTerm4Id = '0-e2e-sellerTerm4Id';
const sellerTerm5Id = '0-e2e-sellerTerm5Id';
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
  directors: [{ firstName: 'John', lastName: 'Doe' }],
  genres: ['documentary', 'crime'],
});

const sellerContract = createMandate({
  id: sellerContractId,
  titleId: sellerMovieId,
  sellerId: sellerOrgId,
  termIds: [sellerTerm1Id, sellerTerm2Id, sellerTerm3Id],
  stakeholders: [centralOrgId.catalog, sellerOrgId],
  buyerId: centralOrgId.catalog,
  status: 'accepted',
});

const januaryFirstNextYear = startOfYear(add(new Date(), { years: 1 }));
const januaryFirstInTwoYears = startOfYear(add(new Date(), { years: 2 }));
const januaryFirstInThreeYears = startOfYear(add(new Date(), { years: 3 }));

export const europeanCountries = territoriesGroup
  .map(group => group.label === 'Europe' && group.items)
  .filter(Boolean)
  .flat(2);

const sellerTerm1 = createTerm({
  id: sellerTerm1Id,
  contractId: sellerContractId,
  duration: {
    from: januaryFirstNextYear,
    to: endOfMonth(add(januaryFirstNextYear, { months: 5 })), //June 30th of next year
  },
  medias: ['payTv', 'freeTv', 'payPerView', 'rental', 'festival'],
  territories: europeanCountries,
});

// sellerTerm2 and 3 should overlap when searching : Europe, TV, non-exclusive
const sellerTerm2 = createTerm({
  id: sellerTerm2Id,
  contractId: sellerContractId,
  duration: {
    from: januaryFirstInTwoYears,
    to: endOfMonth(add(januaryFirstInTwoYears, { months: 5 })),
  },
  medias: ['payTv', 'payPerView'], // TV media part 1
  territories: europeanCountries,
});
const sellerTerm3 = createTerm({
  id: sellerTerm3Id,
  contractId: sellerTerm2.contractId,
  duration: sellerTerm2.duration,
  medias: ['freeTv'], // TV media part 2
  territories: sellerTerm2.territories,
  exclusive: true,
});

// sellerTerm4 and 5 should overlap when searching : Europe, TV, non-exclusive
const sellerTerm4 = createTerm({
  id: sellerTerm4Id,
  contractId: sellerContractId,
  duration: {
    from: januaryFirstInThreeYears,
    to: endOfMonth(add(januaryFirstInThreeYears, { months: 5 })),
  },
  medias: ['payTv', 'freeTv', 'payPerView'],
  territories: europeanCountries.filter(territory => territory !== 'france'), // Europe part 1
});
const sellerTerm5 = createTerm({
  id: sellerTerm5Id,
  contractId: sellerTerm4.contractId,
  duration: sellerTerm4.duration,
  medias: sellerTerm4.medias,
  territories: ['france'], // Europe part 2
  exclusive: true,
});

const seller = {
  user: sellerUser,
  org: sellerOrg,
  orgPermissions: sellerOrgPermissions,
  movie: sellerAcceptedMovie,
  moviePermissions: sellerMoviePermissions,
  contract: sellerContract,
  term1: sellerTerm1,
  term2: sellerTerm2,
  term3: sellerTerm3,
  term4: sellerTerm4,
  term5: sellerTerm5,
};

export { buyer, seller };
