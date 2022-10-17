import { createFakeUserDataArray, E2eLegalTerms } from '@blockframes/testing/cypress/browser';
import {
  createMovie,
  createMoviePromotional,
  createMovieVideo,
  createPermissions,
  DocPermissionsDocument,
  Event,
  createTitle,
  createMovieAppConfig,
  createAppConfig,
  createUser,
  createOrganization,
  createOrgAppAccess,
} from '@blockframes/model';

const dashboardAdminUid = '0-e2e-dashboardAdminUid';
const marketplaceUserUid = '0-e2e-marketplaceUserUid';
const dashboardOrgId = '0-e2e-dashboardOrgId';
const marketplaceOrgId = '0-e2e-marketplaceOrgId';
const [dashboardUserData, marketplaceUserData] = createFakeUserDataArray(2);
const dummyEventId = '0-e2e-dummyEvent';

//* dashboard user *//

export const dashboardUser = createUser({
  uid: dashboardAdminUid,
  firstName: dashboardUserData.firstName,
  lastName: dashboardUserData.lastName,
  email: dashboardUserData.email,
  orgId: dashboardOrgId,
  termsAndConditions: {
    festival: E2eLegalTerms,
  },
  privacyPolicy: E2eLegalTerms,
});

export const dashboardOrg = createOrganization({
  id: dashboardOrgId,
  name: dashboardUserData.company.name,
  userIds: [dashboardAdminUid],
  email: dashboardUserData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: true } }),
});

export const dashboardPermissions = createPermissions({
  id: dashboardOrgId,
  roles: { [dashboardAdminUid]: 'superAdmin' },
});

export const dashboardDocumentPermissions: DocPermissionsDocument = {
  id: dummyEventId,
  ownerId: dashboardOrgId,
  canCreate: true,
  canDelete: true,
  canRead: true,
  canUpdate: true,
  isAdmin: true,
};

//* marketplace user *//

export const marketplaceUser = createUser({
  uid: marketplaceUserUid,
  firstName: marketplaceUserData.firstName,
  lastName: marketplaceUserData.lastName,
  email: marketplaceUserData.email,
  orgId: marketplaceOrgId,
  termsAndConditions: {
    festival: E2eLegalTerms,
  },
  privacyPolicy: E2eLegalTerms,
});

export const marketplaceOrg = createOrganization({
  id: marketplaceOrgId,
  name: marketplaceUserData.company.name,
  userIds: [marketplaceUserUid],
  email: marketplaceUserData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: false } }),
});

export const marketplacePermissions = createPermissions({
  id: marketplaceOrgId,
  roles: { [marketplaceUserUid]: 'superAdmin' },
});

//* movies *//

export const screenerMovie = createMovie({
  id: '0-e2e-screenerMovie',
  directors: [],
  genres: [],
  originalLanguages: [],
  originCountries: [],
  synopsis: 'This is a movie for e2e tests, which contains a screener',
  orgIds: [dashboardOrgId],
  title: createTitle({
    original: 'screenerMovie',
    international: 'screenerMovie',
  }),
  app: createMovieAppConfig({
    festival: createAppConfig({ status: 'accepted', access: true }),
  }),
  promotional: createMoviePromotional({ videos: { screener: createMovieVideo({ jwPlayerId: 'YlSFNnkR' }) } }),
});

export const noScreenerMovie = createMovie({
  id: '0-e2e-noScreenerMovie',
  directors: [],
  genres: [],
  originalLanguages: [],
  originCountries: [],
  synopsis: 'This is a movie for e2e tests, which does not contain a screener',
  orgIds: [dashboardOrgId],
  title: createTitle({
    original: 'noScreenerMovie',
    international: 'noScreenerMovie',
  }),
  app: createMovieAppConfig({
    festival: createAppConfig({ status: 'accepted', access: true }),
  }),
});

//* events *//

const dummyEventTime = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(12, 0, 0, 0);
  const start = new Date(date);
  date.setHours(12, 30, 0, 0);
  const end = new Date(date);
  return { start, end };
};

export const dummyEvent: Event = {
  id: dummyEventId,
  accessibility: 'public',
  allDay: false,
  isSecret: false,
  meta: {
    titleId: noScreenerMovie.id,
    organizerUid: dashboardAdminUid,
    description: '',
  },
  ownerOrgId: dashboardOrgId,
  title: 'dummy injected event',
  type: 'screening',
  isOwner: true,
  start: dummyEventTime().start,
  end: dummyEventTime().end,
};
