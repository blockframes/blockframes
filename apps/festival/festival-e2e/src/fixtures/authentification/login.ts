import { PublicUser, PermissionsDocument, OrganizationDocument } from '@blockframes/model';
import { fakeUserData } from '@blockframes/testing/cypress/browser';
import { Timestamp } from 'firebase/firestore';

const adminUid = '0-e2e-orgAdminUid';
const orgId = '0-e2e-orgId';
const userData = fakeUserData();
const now = new Date();

export const user: PublicUser = {
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
};

export const org: OrganizationDocument = {
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
    createdAt: Timestamp.now(),
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

export const permissions: PermissionsDocument = {
  id: orgId,
  canUpdate: [],
  roles: {
    [`${adminUid}`]: 'superAdmin',
  },
  canRead: [],
  canCreate: [],
  canDelete: [],
};
