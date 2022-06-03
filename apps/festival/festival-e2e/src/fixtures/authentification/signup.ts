import { Organization, PublicUser, PermissionsDocument } from '@blockframes/model';
import { createFakeUserDataArray } from '@blockframes/testing/cypress/browser';

const newUserUid = '0-e2e-newUserUid';
const marketplaceOrgAdminUid = '0-e2e-marketplaceOrgAdminUid';
const dashboardOrgAdminUid = '0-e2e-dashboardOrgAdminUid';
const marketplaceOrgId = '0-e2e-marketplaceOrgId';
const dashboardOrgId = '0-e2e-dashboardOrgId';
const [newUserData, marketplaceOrgAdminData, dashboardOrgAdminData] = createFakeUserDataArray(3);
const now = new Date();

//* Creation consts

const e2eUser = (data: { uid: string; firstName: string; lastName: string; email: string }): PublicUser => {
  const { uid, firstName, lastName, email } = data;
  return {
    uid,
    firstName,
    lastName,
    email,
    hideEmail: false,
    _meta: {
      emailVerified: true,
      createdFrom: 'festival',
      createdBy: 'anonymous',
      createdAt: now,
    },
  };
};

const e2eOrg = (data: { id: string; name: string; userIds: string[]; email: string; dashboardAccess: boolean }): Organization => {
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
      createdBy: marketplaceOrgAdminUid,
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

const e2ePermissions = (data: { id: string; adminUid: string }): PermissionsDocument => {
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

//* FIXTURES *//

//* New user

export const newUser = e2eUser({
  uid: newUserUid,
  firstName: newUserData.firstName,
  lastName: newUserData.lastName,
  email: newUserData.email,
});

export const newOrg = {
  name: newUserData.company.name,
  country: newUserData.company.country,
  activity: newUserData.company.activity,
};

//* Marketplace admin, org and permissions
const marketplaceOrgAdmin = e2eUser({
  uid: marketplaceOrgAdminUid,
  firstName: marketplaceOrgAdminData.firstName,
  lastName: marketplaceOrgAdminData.lastName,
  email: marketplaceOrgAdminData.email,
});

const marketplaceOrg = e2eOrg({
  id: marketplaceOrgId,
  name: marketplaceOrgAdminData.company.name,
  userIds: [marketplaceOrgAdminUid],
  email: marketplaceOrgAdminData.email,
  dashboardAccess: false,
});

const marketplaceOrgPermissions = e2ePermissions({
  id: marketplaceOrgId,
  adminUid: marketplaceOrgAdminUid,
});

export const marketplaceData = {
  orgAdmin: marketplaceOrgAdmin,
  org: marketplaceOrg,
  permissions: marketplaceOrgPermissions,
};

//* Dashboard admin, org and permissions
const dashboardOrgAdmin = e2eUser({
  uid: dashboardOrgAdminUid,
  firstName: dashboardOrgAdminData.firstName,
  lastName: dashboardOrgAdminData.lastName,
  email: dashboardOrgAdminData.email,
});

const dashboardOrg = e2eOrg({
  id: dashboardOrgId,
  name: dashboardOrgAdminData.company.name,
  userIds: [dashboardOrgAdminUid],
  email: dashboardOrgAdminData.email,
  dashboardAccess: true,
});

const dashboardOrgPermissions = e2ePermissions({
  id: dashboardOrgId,
  adminUid: dashboardOrgAdminUid,
});

export const dashboardData = {
  orgAdmin: dashboardOrgAdmin,
  org: dashboardOrg,
  permissions: dashboardOrgPermissions,
};
