import { fakeUserData } from '@blockframes/testing/cypress/browser';
import {
  createPermissions,
  createUser,
  createOrganization,
  createOrgAppAccess,
  createAddressSet,
  createLocation,
  fakeLegalTerms,
} from '@blockframes/model';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const acceptedBuyerOrgid = '0-e2e-acceptedBuyerOrgid';
const acceptedBuyerOrgName = 'E2E accepted buyer org';
const dashboardBuyerOrgid = '0-e2e-dashboardBuyerOrgid';
const dashboardBuyerOrgName = 'E2E dashboard buyer org';
const pendingBuyerOrgid = '0-e2e-pendingBuyerOrgid';
const pendingBuyerOrgName = 'E2e pending buyer org';
const catalogBuyerOrgid = '0-e2e-catalogBuyerOrgid';
const catalogBuyerOrgName = 'E2e catalog buyer org';
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
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: true } }),
});

export const acceptedBuyerOrg = createOrganization({
  id: acceptedBuyerOrgid,
  name: acceptedBuyerOrgName,
  activity: 'director',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: false } }),
});

export const dashboardBuyerOrg = createOrganization({
  id: dashboardBuyerOrgid,
  name: dashboardBuyerOrgName,
  activity: 'buyersRep',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: true } }),
});

export const pendingBuyerOrg = createOrganization({
  id: pendingBuyerOrgid,
  name: pendingBuyerOrgName,
  activity: 'inflight',
  status: 'pending',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: false } }),
});

export const catalogBuyerOrg = createOrganization({
  id: catalogBuyerOrgid,
  name: catalogBuyerOrgName,
  activity: 'organization',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ catalog: { marketplace: true, dashboard: false } }),
});

export const orgPermissions = createPermissions({
  id: orgId,
  roles: { [adminUid]: 'superAdmin' },
});
