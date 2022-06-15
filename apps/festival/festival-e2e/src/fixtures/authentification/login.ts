import { e2eUser, e2eOrg, e2ePermissions, fakeUserData } from '@blockframes/testing/cypress/browser';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const userData = fakeUserData();

export const user = e2eUser({
  uid: adminUid,
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  orgId: orgId,
});

export const org = e2eOrg({
  id: orgId,
  name: userData.company.name,
  userIds: [adminUid],
  email: userData.email,
  dashboardAccess: false,
});

export const permissions = e2ePermissions({
  id: orgId,
  adminUid: adminUid,
});
