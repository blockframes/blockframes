import { e2eUser, e2eOrg, e2eOrgPermissions, createFakeUserDataArray } from '@blockframes/testing/cypress/browser';
import { createMovie, createMoviePromotional, createMovieVideo, DocPermissionsDocument, Event } from '@blockframes/model';

const dashboardAdminUid = '0-e2e-dashboardAdminUid';
const marketplaceUserUid = '0-e2e-marketplaceUserUid';
const dashboardOrgId = '0-e2e-dashboardOrgId';
const marketplaceOrgId = '0-e2e-marketplaceOrgId';
const [dashboardUserData, marketplaceUserData] = createFakeUserDataArray(2);
const dummyEventId = '0-e2e-dummyEvent';

//* dashboard user *//

export const dashboardUser = e2eUser({
  uid: dashboardAdminUid,
  firstName: dashboardUserData.firstName,
  lastName: dashboardUserData.lastName,
  email: dashboardUserData.email,
  app: 'festival',
  orgId: dashboardOrgId,
});

export const dashboardOrg = e2eOrg({
  id: dashboardOrgId,
  name: dashboardUserData.company.name,
  userIds: [dashboardAdminUid],
  email: dashboardUserData.email,
  app: 'festival',
  dashboardAccess: true,
});

export const dashboardPermissions = e2eOrgPermissions({
  orgId: dashboardOrgId,
  adminUid: dashboardAdminUid,
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

export const marketplaceUser = e2eUser({
  uid: marketplaceUserUid,
  firstName: marketplaceUserData.firstName,
  lastName: marketplaceUserData.lastName,
  email: marketplaceUserData.email,
  app: 'festival',
  orgId: marketplaceOrgId,
});

export const marketplaceOrg = e2eOrg({
  id: marketplaceOrgId,
  name: marketplaceUserData.company.name,
  userIds: [marketplaceUserUid],
  email: marketplaceUserData.email,
  app: 'festival',
  dashboardAccess: false,
});

export const marketplacePermissions = e2eOrgPermissions({
  orgId: marketplaceOrgId,
  adminUid: marketplaceUserUid,
});

//* movies *//

export const screenerMovie = createMovie({
  id: '0-e2e-screenerMovie',
  _type: 'movies',
  contentType: 'movie',
  directors: [],
  genres: [],
  originalLanguages: [],
  originCountries: [],
  synopsis: 'This is a movie for e2e tests, which contains a screener',
  orgIds: [dashboardOrgId],
  title: {
    original: 'screenerMovie',
    international: 'screenerMovie',
  },
  app: {
    festival: {
      access: true,
      refusedAt: null,
      submittedAt: null,
      acceptedAt: new Date(),
      status: 'accepted',
    },
  },
  promotional: createMoviePromotional({ videos: { screener: createMovieVideo({ jwPlayerId: 'YlSFNnkR' }) } }),
});

export const noScreenerMovie = createMovie({
  id: '0-e2e-noScreenerMovie',
  _type: 'movies',
  contentType: 'movie',
  directors: [],
  genres: [],
  originalLanguages: [],
  originCountries: [],
  synopsis: 'This is a movie for e2e tests, which does not contain a screener',
  orgIds: [dashboardOrgId],
  title: {
    original: 'noScreenerMovie',
    international: 'noScreenerMovie',
  },
  app: {
    festival: {
      access: true,
      refusedAt: null,
      submittedAt: null,
      acceptedAt: new Date(),
      status: 'accepted',
    },
  },
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
