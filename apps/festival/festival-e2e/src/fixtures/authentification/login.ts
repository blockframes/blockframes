import { fakeUserData } from '@blockframes/testing/cypress/browser';
import { createPermissions, createUser, createOrganization, createOrgAppAccess, fakeLegalTerms } from '@blockframes/model';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const userData = fakeUserData();

export const user = createUser({
  uid: adminUid,
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  orgId: orgId,
  termsAndConditions: {
    catalog: fakeLegalTerms,
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

export const permissions = createPermissions({
  id: orgId,
  roles: { [adminUid]: 'superAdmin' },
});
