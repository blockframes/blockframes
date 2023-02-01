import { createFakeUserDataArray } from '@blockframes/testing/cypress/browser';
import { createPermissions, createUser, createOrganization, createOrgAppAccess, fakeLegalTerms } from '@blockframes/model';

const blockframesAdminId = '0-e2e-blockframesAdminId';
const blockframesOrgAdminId = '0-e2e-orgAdminId';
const [blockframesAdminData, newUserData] = createFakeUserDataArray(2);

//* blockframes admin

const blockframesAdmin = createUser({
  uid: blockframesAdminId,
  firstName: blockframesAdminData.firstName,
  lastName: blockframesAdminData.lastName,
  email: blockframesAdminData.email,
  orgId: blockframesOrgAdminId,
  termsAndConditions: {
    catalog: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
});

const blockframesAdminOrg = createOrganization({
  id: blockframesOrgAdminId,
  name: blockframesAdminData.company.name,
  userIds: [blockframesAdminId],
  email: blockframesAdminData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({}),
});

const permissions = createPermissions({
  id: blockframesOrgAdminId,
  roles: { [blockframesAdminId]: 'superAdmin' },
});

export const admin = {
  user: blockframesAdmin,
  org: blockframesAdminOrg,
  permissions,
};

//* new org

export const newUser = createUser({
  firstName: newUserData.firstName,
  lastName: newUserData.lastName,
  email: newUserData.email,
});

export const newOrg = createOrganization({
  name: newUserData.company.name,
  email: newUserData.email,
});
