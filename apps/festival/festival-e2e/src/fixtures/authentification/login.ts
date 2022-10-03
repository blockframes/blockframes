import { e2eUser, e2eOrg, fakeUserData } from '@blockframes/testing/cypress/browser';
import { createPermissions } from '@blockframes/model';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const userData = fakeUserData();

export const user = e2eUser({
  uid: adminUid,
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  app: 'festival',
  orgId: orgId,
});

export const org = e2eOrg({
  id: orgId,
  name: userData.company.name,
  userIds: [adminUid],
  email: userData.email,
  app: 'festival',
  dashboardAccess: false,
});

export const permissions = createPermissions({
  id: orgId,
  roles: { [adminUid]: 'superAdmin' },
});
