import { PublicUser, PermissionsDocument, Organization } from '@blockframes/model';
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
  orgId?: string;
}

export const e2eUser = (data: E2EUser): PublicUser => {
  const { uid, firstName, lastName, email, orgId } = data;
  return {
    uid,
    firstName,
    lastName,
    email,
    orgId,
    hideEmail: false,
    _meta: {
      emailVerified: true,
      createdFrom: 'festival',
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
  dashboardAccess: boolean;
}

export const e2eOrg = (data: E2EOrganization): Organization => {
  const { id, name, userIds, email, dashboardAccess } = data;
  return {
    id,
    denomination: {
      public: null,
      full: name,
    },
    userIds,
    email,
    status: 'accepted',
    activity: 'actor',
    _meta: {
      createdAt: now,
      createdFrom: 'festival',
      createdBy: 'e2e-test',
    },
    appAccess: {
      festival: {
        marketplace: true,
        dashboard: dashboardAccess,
      },
      catalog: {
        marketplace: false,
        dashboard: false,
      },
      crm: {
        marketplace: false,
        dashboard: false,
      },
      financiers: {
        marketplace: false,
        dashboard: false,
      },
    },
    fiscalNumber: '',
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

export const e2ePermissions = (data: { id: string; adminUid: string }): PermissionsDocument => {
  const { id, adminUid } = data;
  return {
    id,
    roles: {
      [adminUid]: 'superAdmin',
    },
    canCreate: [],
    canDelete: [],
    canRead: [],
    canUpdate: [],
  };
};

//* ------------------------------------- *//
