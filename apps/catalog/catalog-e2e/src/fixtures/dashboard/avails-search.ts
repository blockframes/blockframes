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
import { add, startOfYear } from 'date-fns';
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

const sellerData = fakeUserData();
const sellerAdminUid = '0-e2e-sellerOrgAdminUid';
const sellerOrgId = '0-e2e-sellerOrgId';
// 1st movie data
const sellerMovie1Id = '0-e2e-sellerMovie1Id';
const sellerContract1Id = '0-e2e-sellerContract1Id';
const sellerTerm1Id = '0-e2e-sellerTerm1Id';
// 2nd
const sellerMovie2Id = '0-e2e-sellerMovie2Id';
const sellerContract2Id = '0-e2e-sellerContract2Id';
const sellerTerm2Id = '0-e2e-sellerTerm2Id';
// 3rd
const sellerMovie3Id = '0-e2e-sellerMovie3Id';
const sellerContract3Id = '0-e2e-sellerContract3Id';
const sellerTerm3Id = '0-e2e-sellerTerm3Id';

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

// movie permissions

const moviePermission = (id: string) => createDocPermissions({ id, ownerId: sellerOrgId });

const sellerMoviePermissions = [
  moviePermission(sellerMovie1Id),
  moviePermission(sellerMovie2Id),
  moviePermission(sellerMovie3Id),
];

// movies

const sellerMovie = ({ id, title }: { id: string; title: string }) =>
  createMovie({
    id,
    orgIds: [sellerOrgId],
    app: createMovieAppConfig({
      catalog: createAppConfig({ status: 'accepted', access: true }),
    }),
    //main
    productionStatus: 'released',
    title: createTitle({
      international: title,
    }),
  });

const sellerMovies = [
  sellerMovie({ id: sellerMovie1Id, title: 'First movie' }),
  sellerMovie({ id: sellerMovie2Id, title: 'Second movie' }),
  sellerMovie({ id: sellerMovie3Id, title: 'Third movie' }),
];

// contracts

const contract = ({ id, titleId, termId }: { id: string; titleId: string; termId: string }) =>
  createMandate({
    id,
    titleId,
    sellerId: sellerOrgId,
    termIds: [termId],
    stakeholders: [centralOrgId.catalog, sellerOrgId],
    buyerId: centralOrgId.catalog,
    status: 'accepted',
  });

const sellerContracts = [
  contract({ id: sellerContract1Id, titleId: sellerMovie1Id, termId: sellerTerm1Id }),
  contract({ id: sellerContract2Id, titleId: sellerMovie2Id, termId: sellerTerm2Id }),
  contract({ id: sellerContract3Id, titleId: sellerMovie3Id, termId: sellerTerm3Id }),
];

// terms

const januaryFirstNextYear = startOfYear(add(new Date(), { years: 1 }));
const aprilFirstNextYears = add(januaryFirstNextYear, { months: 3 });
const juneFirstNextYears = add(januaryFirstNextYear, { months: 5 });

function addSixMonthsTo(date: Date) {
  return add(date, { months: 6 });
}

export const europeanCountries = territoriesGroup
  .map(group => group.label === 'Europe' && group.items)
  .filter(Boolean)
  .flat(2);

export const northAmericanCountries = territoriesGroup
  .map(group => group.label === 'North America' && group.items)
  .filter(Boolean)
  .flat(2);

const sellerTerms = [
  createTerm({
    id: sellerTerm1Id,
    contractId: sellerContract1Id,
    duration: {
      from: januaryFirstNextYear,
      to: addSixMonthsTo(januaryFirstNextYear),
    },
    medias: ['payTv', 'freeTv', 'payPerView', 'rental', 'festival'],
    territories: europeanCountries,
  }),
  createTerm({
    id: sellerTerm2Id,
    contractId: sellerContract2Id,
    duration: {
      from: aprilFirstNextYears,
      to: addSixMonthsTo(aprilFirstNextYears),
    },
    medias: ['rental', 'festival'],
    territories: europeanCountries,
  }),
  createTerm({
    id: sellerTerm3Id,
    contractId: sellerContract3Id,
    duration: {
      from: juneFirstNextYears,
      to: addSixMonthsTo(juneFirstNextYears),
    },
    medias: ['payTv', 'freeTv', 'payPerView', 'rental', 'festival'],
    territories: northAmericanCountries,
    exclusive: true,
  }),
];

// assemble and export

const seller = {
  user: sellerUser,
  org: sellerOrg,
  orgPermissions: sellerOrgPermissions,
  moviePermissions: sellerMoviePermissions,
  movies: sellerMovies,
  contracts: sellerContracts,
  terms: sellerTerms,
};

export { buyer, seller };
