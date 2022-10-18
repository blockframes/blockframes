import { createFakeUserDataArray } from '@blockframes/testing/cypress/browser';
import {
  createPermissions,
  createUser,
  createOrganization,
  createOrgAppAccess,
  createAddressSet,
  createLocation,
  legalTerms,
} from '@blockframes/model';

const newUserUid = '0-e2e-newUserUid';
const marketplaceOrgAdminUid = '0-e2e-marketplaceOrgAdminUid';
const dashboardOrgAdminUid = '0-e2e-dashboardOrgAdminUid';
const marketplaceOrgId = '0-e2e-marketplaceOrgId';
const dashboardOrgId = '0-e2e-dashboardOrgId';
const [newUserData, marketplaceOrgAdminData, dashboardOrgAdminData] = createFakeUserDataArray(3);

//* New user

export const newUser = createUser({
  uid: newUserUid,
  firstName: newUserData.firstName,
  lastName: newUserData.lastName,
  email: newUserData.email,
});

export const newOrg = {
  name: newUserData.company.name,
  country: newUserData.company.country,
  activity: newUserData.company.activity,
};

//* ------------------------------------- *//

//* Marketplace admin, org and permissions *//

const marketplaceOrgAdmin = createUser({
  uid: marketplaceOrgAdminUid,
  firstName: marketplaceOrgAdminData.firstName,
  lastName: marketplaceOrgAdminData.lastName,
  email: marketplaceOrgAdminData.email,
  orgId: marketplaceOrgId,
  termsAndConditions: {
    festival: legalTerms,
  },
  privacyPolicy: legalTerms,
});

const marketplaceOrg = createOrganization({
  id: marketplaceOrgId,
  name: marketplaceOrgAdminData.company.name,
  userIds: [marketplaceOrgAdminUid],
  email: marketplaceOrgAdminData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: false } }),
  activity: 'actor',
  addresses: createAddressSet({
    main: createLocation({ country: 'france' }),
  }),
});

const marketplaceOrgPermissions = createPermissions({
  id: marketplaceOrgId,
  roles: { [marketplaceOrgAdminUid]: 'superAdmin' },
});

export const marketplaceData = {
  orgAdmin: marketplaceOrgAdmin,
  org: marketplaceOrg,
  permissions: marketplaceOrgPermissions,
};

//* ------------------------------------- *//

//* Dashboard admin, org and permissions *//

const dashboardOrgAdmin = createUser({
  uid: dashboardOrgAdminUid,
  firstName: dashboardOrgAdminData.firstName,
  lastName: dashboardOrgAdminData.lastName,
  email: dashboardOrgAdminData.email,
  orgId: dashboardOrgId,
  termsAndConditions: {
    festival: legalTerms,
  },
  privacyPolicy: legalTerms,
});

const dashboardOrg = createOrganization({
  id: dashboardOrgId,
  name: dashboardOrgAdminData.company.name,
  userIds: [dashboardOrgAdminUid],
  email: dashboardOrgAdminData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: true } }),
  activity: 'actor',
  addresses: createAddressSet({
    main: createLocation({ country: 'france' }),
  }),
});

const dashboardOrgPermissions = createPermissions({
  id: dashboardOrgId,
  roles: { [dashboardOrgAdminUid]: 'superAdmin' },
});

export const dashboardData = {
  orgAdmin: dashboardOrgAdmin,
  org: dashboardOrg,
  permissions: dashboardOrgPermissions,
};

//* ------------------------------------- *//
