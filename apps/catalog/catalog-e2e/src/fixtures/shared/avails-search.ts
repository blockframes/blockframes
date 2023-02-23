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

//* seller 1 data */

const seller1AdminUid = '0-e2e-seller1OrgAdminUid';
const seller1OrgId = '0-e2e-seller1OrgId';
const seller1MovieId = '0-e2e-seller1MovieId';
const seller1ContractId = '0-e2e-seller1ContractId';
const seller1TermId = '0-e2e-seller1TermId';
const seller1Data = fakeUserData();

const seller1User = createUser({
  uid: seller1AdminUid,
  firstName: seller1Data.firstName,
  lastName: seller1Data.lastName,
  email: seller1Data.email,
  orgId: seller1OrgId,
  termsAndConditions: {
    catalog: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
});

const seller1Org = createOrganization({
  id: seller1OrgId,
  name: seller1Data.company.name,
  userIds: [seller1AdminUid],
  email: seller1Data.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ catalog: { marketplace: true, dashboard: true } }),
});

const seller1OrgPermissions = createPermissions({
  id: seller1OrgId,
  roles: { [seller1AdminUid]: 'superAdmin' },
});

const seller1MoviePermissions = createDocPermissions({
  id: seller1MovieId,
  ownerId: seller1OrgId,
});

const seller1AcceptedMovie = createMovie({
  id: seller1MovieId,
  orgIds: [seller1OrgId],
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

const seller1Contract = createMandate({
  id: seller1ContractId,
  titleId: seller1MovieId,
  sellerId: seller1OrgId,
  termIds: [seller1TermId],
  stakeholders: [centralOrgId.catalog, seller1OrgId],
  buyerId: centralOrgId.catalog,
  status: 'accepted',
});

const nextJanuaryFirst = startOfYear(add(new Date(), { years: 1 }));

const seller1Term = createTerm({
  id: seller1TermId,
  contractId: seller1ContractId,
  duration: {
    from: nextJanuaryFirst,
    to: endOfMonth(add(nextJanuaryFirst, { months: 5 })), //June 30th of next year
  },
  medias: ['payTv', 'freeTv', 'payPerView', 'rental', 'festival'],
  territories: [
    //all territories in Europe and Latin America, plus Nepal = 69 countries
    territoriesGroup.map(group => group.label === 'Europe' && group.items).filter(Boolean),
  ].flat(2),
});

const seller1 = {
  user: seller1User,
  org: seller1Org,
  orgPermissions: seller1OrgPermissions,
  movie: seller1AcceptedMovie,
  moviePermissions: seller1MoviePermissions,
  contract: seller1Contract,
  term: seller1Term,
};

export { buyer, seller1 };
