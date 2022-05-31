import { fakeUserData } from '@blockframes/testing/cypress/browser';
import { firestore } from 'firebase-admin';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const userData = fakeUserData();
const now = firestore.Timestamp.now();

export const user = {
  uid: adminUid,
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  hideEmail: false,
  orgId: orgId,
  _meta: {
    emailVerified: true,
    createdFrom: 'festival',
    createdBy: 'anonymous',
    createdAt: now,
  },
  privacyPolicy: {
    ip: 'unknown',
    date: now,
  },
};

export const org = {
  id: orgId,
  denomination: {
    public: null,
    full: userData.company.name,
  },
  userIds: [adminUid],
  email: userData.email,
  status: 'accepted',
  activity: 'actor',
  _meta: {
    createdAt: now,
    createdFrom: 'festival',
    createdBy: adminUid,
  },
  appAccess: {
    festival: {
      marketplace: true,
      dashboard: false,
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

export const permissions = {
  id: orgId,
  canUpdate: [],
  roles: {
    [`${adminUid}`]: 'superAdmin',
  },
  canRead: [],
  canCreate: [],
  canDelete: [],
};
