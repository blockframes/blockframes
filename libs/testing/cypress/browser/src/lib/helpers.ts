import { PermissionsDocument, DocPermissionsDocument, Organization, User, App } from '@blockframes/model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
import { serverId } from '@blockframes/utils/constants';
import faker from '@faker-js/faker';
const now = new Date();

export const fakeUserData = () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email(firstName, lastName, `${serverId}.mailosaur.net`).toLowerCase();
  return {
    firstName,
    lastName,
    email,
    uid: '0-tempUid',
    country: 'France',
    password: USER_FIXTURES_PASSWORD,
    company: {
      name: `${firstName} ${lastName} corporation`,
      activity: 'Organization',
      country: 'France',
    },
    role: 'Buyer',
    indicator: '+33',
    phone: '123456789',
  };
};

export function createFakeUserDataArray(number: number) {
  const fakeUserDataArray = [];
  for (let i = 0; i < number; i++) {
    fakeUserDataArray.push(fakeUserData());
  }
  return fakeUserDataArray;
}

//* E2E VARIABLES CREATIONS *//

interface E2EUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  app: App;
  orgId?: string;
}

export const e2eUser = (data: E2EUser): User => {
  const legalTerms = {
    date: new Date(),
    ip: '111.111.111.111',
  };
  const { uid, firstName, lastName, email, app, orgId } = data;
  return {
    uid,
    firstName,
    lastName,
    email,
    orgId,
    hideEmail: false,
    privacyPolicy: legalTerms,
    termsAndConditions: {
      festival: legalTerms,
      catalog: legalTerms,
      financiers: legalTerms,
    },
    phoneNumber: '',
    position: '',
    avatar: null,
    _meta: {
      emailVerified: true,
      createdFrom: app,
      createdBy: 'anonymous',
      createdAt: now,
    },
  };
};

interface E2EOrganization {
  id: string;
  name: string;
  userIds: string[];
  email: string;
  app: App;
  dashboardAccess: boolean;
}

export const e2eOrg = (data: E2EOrganization): Organization => {
  const { id, name, userIds, email, app, dashboardAccess } = data;
  return {
    id,
    name,
    userIds,
    email,
    status: 'accepted',
    activity: 'actor',
    _meta: {
      createdAt: now,
      createdFrom: app,
      createdBy: 'e2e-test',
    },
    appAccess: {
      festival: {
        marketplace: app === 'festival',
        dashboard: app === 'festival' && dashboardAccess,
      },
      catalog: {
        marketplace: app === 'catalog',
        dashboard: app === 'catalog' && dashboardAccess,
      },
      crm: {
        marketplace: app === 'crm',
        dashboard: app === 'crm' && dashboardAccess,
      },
      financiers: {
        marketplace: app === 'financiers',
        dashboard: app === 'financiers' && dashboardAccess,
      },
    },
    wishlist: [],
    description: '',
    addresses: {
      main: {
        zipCode: null,
        country: 'france',
        city: null,
        phoneNumber: null,
        street: null,
        region: null,
      },
    },
    documents: {
      notes: [],
      videos: [],
    },
    logo: {
      docId: '',
      privacy: 'public',
      storagePath: '',
      collection: 'movies',
      field: '',
    },
  };
};

export const e2eOrgPermissions = (data: { orgId: string; adminUid: string }): PermissionsDocument => {
  const { orgId, adminUid } = data;
  return {
    id: orgId,
    roles: {
      [adminUid]: 'superAdmin',
    },
  };
};

export const e2eMoviePermissions = (data: { movieId: string; orgId: string }): DocPermissionsDocument => {
  const { movieId, orgId } = data;
  return {
    id: movieId,
    ownerId: orgId,
    isAdmin: true,
    canCreate: true,
    canDelete: true,
    canRead: true,
    canUpdate: true,
  };
};

//* ------------------------------------- *//
