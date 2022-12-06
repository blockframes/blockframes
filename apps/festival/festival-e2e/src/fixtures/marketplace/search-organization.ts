import { fakeUserData, fakeOrgName } from '@blockframes/testing/cypress/browser';
import {
  createMovie,
  createDocPermissions,
  createPermissions,
  createMovieAppConfig,
  createAppConfig,
  createUser,
  createOrganization,
  createOrgAppAccess,
  createAddressSet,
  createLocation,
  fakeLegalTerms,
  createDocumentMeta,
} from '@blockframes/model';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const acceptedSaleOrgid = '0-e2e-acceptedSaleOrgid';
const acceptedSaleOrgName = fakeOrgName() + ' sale accepted';
const pendingSaleOrgid = '0-e2e-pendingSaleOrgid';
const pendingSaleOrgName = fakeOrgName() + ' sale pending';
const catalogSaleOrgid = '0-e2e-catalogSaleOrgid';
const catalogSaleOrgName = fakeOrgName() + ' sale catalog';
const movieId = '0-e2e-movieId';
const userData = fakeUserData();

export const user = createUser({
  uid: adminUid,
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  orgId: orgId,
  termsAndConditions: {
    festival: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
});

export const org = createOrganization({
  id: orgId,
  name: userData.company.name,
  userIds: [adminUid],
  email: userData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: false } }),
});

export const acceptedSaleOrg = createOrganization({
  id: acceptedSaleOrgid,
  name: acceptedSaleOrgName,
  activity: 'intlSales',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: true } }),
});

export const pendingSaleOrg = createOrganization({
  id: pendingSaleOrgid,
  name: pendingSaleOrgName,
  activity: 'intlSales',
  status: 'pending',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: true } }),
});

export const catalogSaleOrg = createOrganization({
  id: catalogSaleOrgid,
  name: catalogSaleOrgName,
  activity: 'intlSales',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ catalog: { marketplace: true, dashboard: true } }),
});

export const orgPermissions = createPermissions({
  id: orgId,
  roles: { [adminUid]: 'superAdmin' },
});

export const moviePermissions = createDocPermissions({
  id: movieId,
  ownerId: orgId,
});

export const movie = createMovie({
  _meta: createDocumentMeta(),
  id: movieId,
  orgIds: [orgId, acceptedSaleOrgid, pendingSaleOrgid, catalogSaleOrgid],
  app: createMovieAppConfig({
    festival: createAppConfig({ status: 'accepted', access: true }),
  }),
});
