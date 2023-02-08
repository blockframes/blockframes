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

export type Newcomer = {
  status: OrganizationStatus;
  apps: Exclude<App, 'crm' | 'financiers'>[];
  modules: Module[];
  data: {
    org: Organization;
    user: User;
  };
};

export const newcomers: Newcomer[] = [
  { status: 'accepted', apps: ['catalog'], modules: ['dashboard'], data: createOrgWithuser() },
  { status: 'accepted', apps: ['catalog'], modules: ['marketplace'], data: createOrgWithuser() },
  { status: 'accepted', apps: ['catalog'], modules: ['dashboard', 'marketplace'], data: createOrgWithuser() },
  { status: 'accepted', apps: ['festival'], modules: ['dashboard', 'marketplace'], data: createOrgWithuser() },
  { status: 'accepted', apps: ['festival'], modules: ['dashboard', 'marketplace'], data: createOrgWithuser() },
  { status: 'accepted', apps: ['festival'], modules: ['dashboard', 'marketplace'], data: createOrgWithuser() },
  { status: 'accepted', apps: ['catalog', 'festival'], modules: ['dashboard', 'marketplace'], data: createOrgWithuser() },
  { status: 'accepted', apps: ['catalog', 'festival'], modules: ['dashboard', 'marketplace'], data: createOrgWithuser() },
  { status: 'accepted', apps: ['catalog', 'festival'], modules: ['dashboard', 'marketplace'], data: createOrgWithuser() },
  { status: 'pending', apps: ['catalog'], modules: ['dashboard'], data: createOrgWithuser() },
  { status: 'pending', apps: ['festival'], modules: ['marketplace'], data: createOrgWithuser() },
  { status: 'pending', apps: ['catalog', 'festival'], modules: ['dashboard', 'marketplace'], data: createOrgWithuser() },
  { status: 'onhold', apps: ['catalog'], modules: ['dashboard'], data: createOrgWithuser() },
  { status: 'onhold', apps: ['festival'], modules: ['marketplace'], data: createOrgWithuser() },
  { status: 'onhold', apps: ['catalog', 'festival'], modules: ['dashboard', 'marketplace'], data: createOrgWithuser() },
];

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
