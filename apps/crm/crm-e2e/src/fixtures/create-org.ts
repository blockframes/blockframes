import { fakeUserData } from '@blockframes/testing/cypress/browser';
import {
  createPermissions,
  createUser,
  createOrganization,
  createOrgAppAccess,
  fakeLegalTerms,
  OrganizationStatus,
  App,
  Module,
  Organization,
  User,
  orgActivity,
  territories,
} from '@blockframes/model';
import faker from '@faker-js/faker';

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

type ModuleCombination = Module | 'bothAccess';
type AppCombination = Exclude<App, 'crm' | 'financiers'> | 'bothApps';

type Newcomers = Record<
  OrganizationStatus,
  Record<
    AppCombination,
    Record<
      ModuleCombination,
      {
        org: Organization;
        user: User;
      }
    >
  >
>;

export const newcomers: Newcomers = {
  accepted: {
    catalog: {
      marketplace: createOrgWithuser(),
      dashboard: createOrgWithuser(),
      bothAccess: createOrgWithuser(),
    },
    festival: {
      marketplace: createOrgWithuser(),
      dashboard: createOrgWithuser(),
      bothAccess: createOrgWithuser(),
    },
    bothApps: {
      marketplace: createOrgWithuser(),
      dashboard: createOrgWithuser(),
      bothAccess: createOrgWithuser(),
    },
  },
  // no need to test all combinations again
  pending: {
    catalog: {
      marketplace: createOrgWithuser(),
      dashboard: null,
      bothAccess: null,
    },
    festival: {
      marketplace: null,
      dashboard: createOrgWithuser(),
      bothAccess: null,
    },
    bothApps: {
      marketplace: null,
      dashboard: null,
      bothAccess: createOrgWithuser(),
    },
  },
  onhold: {
    catalog: {
      marketplace: null,
      dashboard: null,
      bothAccess: createOrgWithuser(),
    },
    festival: {
      marketplace: createOrgWithuser(),
      dashboard: null,
      bothAccess: null,
    },
    bothApps: {
      marketplace: null,
      dashboard: createOrgWithuser(),
      bothAccess: null,
    },
  },
};

//* functions

function createOrgWithuser() {
  const data = fakeUserData();
  return {
    org: createOrganization({
      name: data.company.name,
      email: 'contact@' + data.email.split('@')[1],
      activity: randomValue(orgActivity),
      addresses: {
        main: {
          country: randomValue(territories),
          region: '', // not in the form
          city: faker.address.cityName(),
          zipCode: faker.address.zipCode(),
          street: 'E2E street',
          phoneNumber: faker.phone.phoneNumber(),
        },
      },
    }),
    user: createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    }),
  };
}

function randomValue(obj) {
  const keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
}
