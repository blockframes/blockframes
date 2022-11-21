import { createFakeUserDataArray } from '@blockframes/testing/cypress/browser';
import {
  createAddressSet,
  createEvent,
  createInvitation,
  createLocation,
  createOrganization,
  createOrgAppAccess,
  createPermissions,
  createPublicOrganization,
  createPublicUser,
  createUser,
  fakeLegalTerms,
} from '@blockframes/model';
import { startOfTomorrow, addHours } from 'date-fns';

const newUser1Uid = '0-e2e-newUser1Uid';
const newUser2Uid = '0-e2e-newUser2Uid';
const dashboardOrgAdminUid = '0-e2e-dashboardOrgAdminUid';
const dashboardOrgId = '0-e2e-dashboardOrgId';
const orgInvitationId = '0-e2e-orgInvitationId';
const meetingInvitationId = '0-e2e-meetingInvitationId';
const meetingEventId = '0-e2e-meetingEventId';
const [newUser1Data, newUser2Data, dashboardOrgAdminData] = createFakeUserDataArray(3);

//* New users data

export const userWithJoinOrgInvitation = createUser({
  uid: newUser1Uid,
  firstName: newUser1Data.firstName,
  lastName: newUser1Data.lastName,
  email: newUser1Data.email,
});

export const userWithEventInvitation = createUser({
  uid: newUser2Uid,
  firstName: newUser2Data.firstName,
  lastName: newUser2Data.lastName,
  email: newUser2Data.email,
});

export const userWithEventInvitationOrg = createOrganization({
  name: newUser2Data.company.name,
  activity: newUser2Data.company.activity,
  addresses: createAddressSet({
    main: createLocation({ country: 'france' }),
  }),
});

//* ------------------------------------- *//

//* Dashboard admin, org and permissions *//

const dashboardOrgAdmin = createUser({
  uid: dashboardOrgAdminUid,
  firstName: dashboardOrgAdminData.firstName,
  lastName: dashboardOrgAdminData.lastName,
  email: dashboardOrgAdminData.email,
  orgId: dashboardOrgId,
  termsAndConditions: {
    festival: fakeLegalTerms,
  },
  privacyPolicy: fakeLegalTerms,
});

const dashboardOrg = createOrganization({
  id: dashboardOrgId,
  name: dashboardOrgAdminData.company.name,
  userIds: [dashboardOrgAdminUid],
  email: dashboardOrgAdminData.email,
  status: 'accepted',
  appAccess: createOrgAppAccess({ festival: { marketplace: true, dashboard: true } }),
  activity: 'actor',
  addresses: createAddressSet({
    main: createLocation({ country: 'france' }),
  }),
});

const dashboardOrgPermissions = createPermissions({
  id: dashboardOrgId,
  roles: { [dashboardOrgAdminUid]: 'superAdmin' },
});

export const dashboardData = {
  orgAdmin: dashboardOrgAdmin,
  org: dashboardOrg,
  permissions: dashboardOrgPermissions,
};

//* ------------------------------------- *//

//* Invitation by dashboard org admin *//

export const orgInvitation = createInvitation({
  id: orgInvitationId,
  type: 'joinOrganization',
  fromOrg: createPublicOrganization({
    id: dashboardOrgId,
    activity: dashboardOrg.activity,
    name: dashboardOrg.name,
  }),
  toUser: createPublicUser({
    uid: userWithJoinOrgInvitation.uid,
    email: userWithJoinOrgInvitation.email,
  }),
});

export const meetingInvitation = createInvitation({
  id: meetingInvitationId,
  type: 'attendEvent',
  eventId: meetingEventId,
  fromOrg: createPublicOrganization({
    id: dashboardOrgId,
    activity: dashboardOrg.activity,
    name: dashboardOrg.name,
  }),
  toUser: createPublicUser({
    uid: userWithEventInvitation.uid,
    email: userWithEventInvitation.email,
  }),
});

//* ------------------------------------- *//

//* Meeting by dashboard org admin *//

export const meetingEvent = createEvent({
  id: meetingEventId,
  title: 'E2E meeting',
  ownerOrgId: dashboardOrgId,
  type: 'meeting',
  meta: {
    organizerUid: dashboardOrgAdminUid,
  },
  start: addHours(startOfTomorrow(), 14),
  end: addHours(startOfTomorrow(), 15),
});

//* ------------------------------------- *//

//* DocIndex for meeting event *//

export const meetingDocIndex = {
  authorOrgId: dashboardOrgAdminUid,
};
