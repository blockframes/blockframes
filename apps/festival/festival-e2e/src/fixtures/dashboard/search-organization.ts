import { fakeUserData, fakeOrgName } from '@blockframes/testing/cypress/browser';
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
export const orgNamePrefix = fakeOrgName();
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
  id: '0-e2e-acceptedBuyerOrgid',
  name: orgNamePrefix + ' buyer accepted',
  activity: 'director',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: false } }),
});

export const anotherAcceptedBuyerOrg = createOrganization({
  id: '0-e2e-anotherAcceptedBuyerOrgid',
  name: 'another buyer accepted',
  activity: 'director',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: false } }),
});

export const dashboardBuyerOrg = createOrganization({
  id: '0-e2e-dashboardBuyerOrgid',
  name: orgNamePrefix + ' buyer dashboard',
  activity: 'buyersRep',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: true } }),
});

export const pendingBuyerOrg = createOrganization({
  id: '0-e2e-pendingBuyerOrgid',
  name: orgNamePrefix + ' buyer pending',
  activity: 'inflight',
  status: 'pending',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: false } }),
});

export const catalogBuyerOrg = createOrganization({
  id: '0-e2e-catalogBuyerOrgid',
  name: orgNamePrefix + ' buyer catalog',
  activity: 'organization',
  status: 'accepted',
  addresses: createAddressSet({ main: createLocation({ country: 'france' }) }),
  appAccess: createOrgAppAccess({ catalog: { marketplace: true, dashboard: false } }),
});

export const orgPermissions = createPermissions({
  id: orgId,
  roles: { [adminUid]: 'superAdmin' },
});
