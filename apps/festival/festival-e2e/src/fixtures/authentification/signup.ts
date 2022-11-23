import { createFakeUserDataArray } from '@blockframes/testing/cypress/browser';
import {
  createAddressSet,
  createLocation,
  createOrganization,
  createOrgAppAccess,
  createPermissions,
  createUser,
  fakeLegalTerms,
} from '@blockframes/model';

const newUser1Uid = '0-e2e-newUser1Uid';
const marketplaceOrgAdminUid = '0-e2e-marketplaceOrgAdminUid';
const dashboardOrgAdminUid = '0-e2e-dashboardOrgAdminUid';
const marketplaceOrgId = '0-e2e-marketplaceOrgId';
const dashboardOrgId = '0-e2e-dashboardOrgId';
const [newUser1Data, marketplaceOrgAdminData, dashboardOrgAdminData] = createFakeUserDataArray(3);

//* New users data

export const newUser = createUser({
  uid: newUser1Uid,
  firstName: newUser1Data.firstName,
  lastName: newUser1Data.lastName,
  email: newUser1Data.email,
});

export const newOrg = createOrganization({
  name: newUser1Data.company.name,
  activity: newUser1Data.company.activity,
  addresses: createAddressSet({
    main: createLocation({ country: 'france' }),
  }),
});

//* ------------------------------------- *//

//* Marketplace admin, org and permissions *//

const marketplaceOrgAdmin = createUser({
  uid: marketplaceOrgAdminUid,
  firstName: marketplaceOrgAdminData.firstName,
  lastName: marketplaceOrgAdminData.lastName,
  email: marketplaceOrgAdminData.email,
  orgId: marketplaceOrgId,
  termsAndConditions: {
    festival: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
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
    festival: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
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
