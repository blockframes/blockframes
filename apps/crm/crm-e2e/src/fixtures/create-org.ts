import { fakeUserData } from '@blockframes/testing/cypress/browser';
import { createPermissions, createUser, createOrganization, createOrgAppAccess, fakeLegalTerms } from '@blockframes/model';

const blockframesAdminId = '0-e2e-blockframesAdminId';
const blockframesOrgAdminId = '0-e2e-orgAdminId';
const blockframesAdminData = fakeUserData();

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

//* new organizations

export const newcomers = {
  accepted: {
    catalog: {
      marketplace: createOrgWithuser(),
      dashboard: createOrgWithuser(),
    },
    festival: {
      marketplace: createOrgWithuser(),
      dashboard: createOrgWithuser(),
    },
  },
  pending: {
    catalog: {
      marketplace: createOrgWithuser(),
      dashboard: createOrgWithuser(),
    },
    festival: {
      marketplace: createOrgWithuser(),
      dashboard: createOrgWithuser(),
    },
  },
  onhold: {
    catalog: {
      marketplace: createOrgWithuser(),
      dashboard: createOrgWithuser(),
    },
    festival: {
      marketplace: createOrgWithuser(),
      dashboard: createOrgWithuser(),
    },
  },
};

//* functions

function createOrgWithuser() {
  const data = fakeUserData();
  return {
    org: createOrganization({
      name: data.company.name,
      email: data.email,
    }),
    user: createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    }),
  };
}
