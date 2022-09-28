import { e2eUser, e2eOrg, e2ePermissions } from '@blockframes/testing/cypress/browser';
import { createFakeUserDataArray } from '@blockframes/testing/cypress/browser';

const newUserUid = '0-e2e-newUserUid';
const marketplaceOrgAdminUid = '0-e2e-marketplaceOrgAdminUid';
const dashboardOrgAdminUid = '0-e2e-dashboardOrgAdminUid';
const marketplaceOrgId = '0-e2e-marketplaceOrgId';
const dashboardOrgId = '0-e2e-dashboardOrgId';
const [newUserData, marketplaceOrgAdminData, dashboardOrgAdminData] = createFakeUserDataArray(3);

//* New user

export const newUser = e2eUser({
  uid: newUserUid,
  firstName: newUserData.firstName,
  lastName: newUserData.lastName,
  email: newUserData.email,
  app: 'festival',
});

export const newOrg = {
  name: newUserData.company.name,
  country: newUserData.company.country,
  activity: newUserData.company.activity,
};

//* ------------------------------------- *//

//* Marketplace admin, org and permissions *//

const marketplaceOrgAdmin = e2eUser({
  uid: marketplaceOrgAdminUid,
  firstName: marketplaceOrgAdminData.firstName,
  lastName: marketplaceOrgAdminData.lastName,
  email: marketplaceOrgAdminData.email,
  app: 'festival',
  orgId: marketplaceOrgId,
});

const marketplaceOrg = e2eOrg({
  id: marketplaceOrgId,
  name: marketplaceOrgAdminData.company.name,
  userIds: [marketplaceOrgAdminUid],
  email: marketplaceOrgAdminData.email,
  app: 'festival',
  dashboardAccess: false,
});

const marketplaceOrgPermissions = e2ePermissions({
  id: marketplaceOrgId,
  adminUid: marketplaceOrgAdminUid,
});

export const marketplaceData = {
  orgAdmin: marketplaceOrgAdmin,
  org: marketplaceOrg,
  permissions: marketplaceOrgPermissions,
};

//* ------------------------------------- *//

//* Dashboard admin, org and permissions *//

const dashboardOrgAdmin = e2eUser({
  uid: dashboardOrgAdminUid,
  firstName: dashboardOrgAdminData.firstName,
  lastName: dashboardOrgAdminData.lastName,
  email: dashboardOrgAdminData.email,
  app: 'festival',
  orgId: dashboardOrgId,
});

const dashboardOrg = e2eOrg({
  id: dashboardOrgId,
  name: dashboardOrgAdminData.company.name,
  userIds: [dashboardOrgAdminUid],
  email: dashboardOrgAdminData.email,
  app: 'festival',
  dashboardAccess: true,
});

const dashboardOrgPermissions = e2ePermissions({
  id: dashboardOrgId,
  adminUid: dashboardOrgAdminUid,
});

export const dashboardData = {
  orgAdmin: dashboardOrgAdmin,
  org: dashboardOrg,
  permissions: dashboardOrgPermissions,
};

//* ------------------------------------- *//
