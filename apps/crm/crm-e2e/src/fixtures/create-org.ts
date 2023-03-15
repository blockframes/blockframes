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
  Scope,
  staticModel,
  StaticModel,
  createModuleAccess,
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
  org: Organization;
  user: User;
};

export const newcomers: Newcomer[] = [
  createOrgWithuser('accepted', ['catalog'], ['dashboard']),
  createOrgWithuser('accepted', ['catalog'], ['dashboard', 'marketplace']),
  createOrgWithuser('accepted', ['festival'], ['marketplace']),
  createOrgWithuser('accepted', ['festival'], ['dashboard', 'marketplace']),
  createOrgWithuser('accepted', ['catalog', 'festival'], ['dashboard', 'marketplace']),
  createOrgWithuser('pending', ['catalog'], ['dashboard']),
  createOrgWithuser('onhold', ['catalog'], ['dashboard']),
];

//* functions

function createOrgWithuser(status: OrganizationStatus, apps: Exclude<App, 'crm' | 'financiers'>[], modules: Module[]) {
  const data = fakeUserData();
  return {
    org: createOrganization({
      name: data.company.name,
      email: 'contact@' + data.email.split('@')[1],
      activity: getRandom('orgActivity'),
      status,
      appAccess: createOrgAppAccess({
        festival: createModuleAccess({
          marketplace: apps.includes('festival') && modules.includes('marketplace'),
          dashboard: apps.includes('festival') && modules.includes('dashboard'),
        }),
        catalog: createModuleAccess({
          marketplace: apps.includes('catalog') && modules.includes('marketplace'),
          dashboard: apps.includes('catalog') && modules.includes('dashboard'),
        }),
      }),
      description: `E2E ${status} - ${apps.join(' & ')} - ${modules.join(' & ')} org`,
      addresses: {
        main: {
          country: getRandom('territories', ['world']),
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

function getRandom<S extends Scope>(base: S, withoutValues: string[] = []): keyof StaticModel[S] {
  const keys = Object.keys(staticModel[base]).filter(k => !withoutValues.includes(k));
  return keys[(keys.length * Math.random()) << 0] as any;
}
