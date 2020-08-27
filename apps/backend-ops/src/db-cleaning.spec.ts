import { initFunctionsTestMock, getTestingProjectId, populate } from '@blockframes/testing/firebase/functions';
import {
  cleanMovies,
  cleanOrganizations,
  cleanPermissions,
  cleanDocsIndex,
  cleanNotifications,
  dayInMillis,
  numberOfDaysToKeepNotifications,
  cleanUsers,
  cleanInvitations,
  cleanDeprecatedData
} from './db-cleaning';
import { every } from 'lodash';
import { AdminAuthMocked } from '@blockframes/testing/firebase';
import { loadAdminServices } from './admin';
import { removeUnexpectedUsers, UserConfig } from './users';
import { getCollectionRef } from '@blockframes/firebase-utils';
import { createHostedMedia } from '@blockframes/media/+state/media.firestore';
import { clearFirestoreData } from '@firebase/testing';

type Snapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
let db: FirebaseFirestore.Firestore;
let adminAuth;

describe('DB cleaning script', () => {
  beforeAll(async () => {
    initFunctionsTestMock();
    const adminServices = loadAdminServices();
    db = adminServices.db;
    // To be sure that tests are not polluted
    await clearFirestoreData({ projectId: getTestingProjectId() });
    adminAuth = new AdminAuthMocked() as any;
  });

  afterEach(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('should return true when cleanDeprecatedData is called', async () => {
    const output = await cleanDeprecatedData(db, adminAuth);
    expect(output).toBeTruthy();
  });

  it('should remove incorrect attributes from users', async () => {
    // User with good org but with "name" and "surname"
    const testUser1 = { uid: 'A', email: 'johndoe@fake.com', name: 'john', surname: 'doe', firstName: 'john', lastName: 'doe', orgId: 'org-A' };

    // User with fake orgId
    const testUser2 = { uid: 'B', email: 'johnmcclain@fake.com', firstName: 'john', lastName: 'mcclain', orgId: 'org-B' };

    const testOrg1 = { id: 'org-A' };

    await populate('users', [testUser1, testUser2]);
    await populate('orgs', [testOrg1]);
    adminAuth.users = [testUser1, testUser2];

    const [organizations, usersBefore] = await Promise.all([
      getCollectionRef('orgs'),
      getCollectionRef('users')
    ]);

    // Check if data have been correctly added
    expect(usersBefore.docs.length).toEqual(2);
    expect(organizations.docs.length).toEqual(1);

    const organizationIds = organizations.docs.map(ref => ref.id);

    await cleanUsers(usersBefore, organizationIds, adminAuth, db);

    const usersAfter: Snapshot = await getCollectionRef('users');
    const cleanedUsers = usersAfter.docs.filter(u => isUserClean(u, organizationIds)).length;

    expect(cleanedUsers).toEqual(2);
  });

  it('should remove unexpected users from auth', async () => {
    const users = [
      { uid: 'A', email: 'A@fake.com' },
      { uid: 'B', email: 'B@fake.com' },
      { uid: 'C', email: 'C@fake.com' },
    ];

    // Load our test set
    await populate('users', users);

    // Check if data have been correctly added
    const usersBefore = await getCollectionRef('users');
    expect(usersBefore.docs.length).toEqual(3);

    // See auth users
    adminAuth.users = [
      { uid: 'A', email: 'A@fake.com' },
      { uid: 'B', email: 'B@fake.com' },
      { uid: 'C', email: 'C@fake.com' },
    ];

    // Add a new auth user that is not on db
    const fakeAuthUser = { uid: 'D', email: 'D@fake.com' };

    adminAuth.users.push(fakeAuthUser);

    const authBefore = await adminAuth.listUsers();
    expect(authBefore.users.length).toEqual(4);

    await removeUnexpectedUsers(usersBefore.docs.map(u => u.data() as UserConfig), adminAuth);

    // An user should have been removed from auth because it is not in DB.
    const authAfter = await adminAuth.listUsers();
    expect(authAfter.users.length).toEqual(3);

    // We check if the good user (abc123) have been removed.
    const user = await adminAuth.getUserByEmail(fakeAuthUser.email);
    expect(user).toEqual(undefined);

  });

  it('should smoothly delete users that are not in auth', async () => {

    // User with no orgId
    const testUser1 = { uid: 'A', email: 'johndoe@fake.com' };
    // User with fake orgId
    const testUser2 = { uid: 'B', email: 'johnmcclain@fake.com', orgId: 'fake-org-id' };

    // Set empty auth
    adminAuth.users = [];

    // Load our test set : only one user
    await populate('users', [testUser1, testUser2]);

    // Check if users have been correctly added
    const usersBefore = await getCollectionRef('users');
    expect(usersBefore.docs.length).toEqual(2);

    await cleanUsers(usersBefore, [], adminAuth, db);

    // Check if user have been correctly removed
    const usersAfter = await getCollectionRef('users');
    expect(usersAfter.docs.length).toEqual(0);

  });

  it('should update org and permissions documents when deleting user with org', async () => {

    const testUser = { uid: 'A', email: 'johndoe@fake.com', orgId: 'orgA' };
    const anotherOrgMember = 'B';
    const testOrg = { id: testUser.orgId, userIds: [anotherOrgMember, testUser.uid] };
    const testPermission = { id: testUser.orgId, roles: { [testUser.uid]: 'admin', [anotherOrgMember]: 'superAdmin' } };

    // Set empty auth
    adminAuth.users = [];

    // Load our test set : only one user
    await populate('users', [testUser]);
    // Loading a fake org belonging to user
    await populate('orgs', [testOrg]);
    // Loading a fake permission document
    await populate('permissions', [testPermission]);

    // Check if user have been correctly added
    const usersBefore = await getCollectionRef('users');
    expect(usersBefore.docs.length).toEqual(1);

    // Check if org have been correctly added
    const orgsBefore = await getCollectionRef('orgs');
    expect(orgsBefore.docs.length).toEqual(1);

    // Check permission org have been correctly added
    const permissionsBefore = await getCollectionRef('permissions');
    expect(permissionsBefore.docs.length).toEqual(1);

    await cleanUsers(usersBefore, [testOrg.id], adminAuth, db);

    /** 
     * In this scenario, user should be removed from DB because it was not found in Auth (empty)
     * Since it is linked to an existing org, org and permissions documents should be updated
     * */

    // Check if user have been correctly removed
    const usersAfter = await getCollectionRef('users');
    expect(usersAfter.docs.length).toEqual(0);

    // Check if userId have been removed from org
    const orgsAfter = await getCollectionRef('orgs');
    const orgAfter = orgsAfter.docs.pop().data();
    expect(orgAfter.userIds.length).toEqual(1);
    expect(orgAfter.userIds[0]).toEqual(anotherOrgMember);

    // Check if permissions have been updated
    const permissionsAfter = await getCollectionRef('permissions');
    const permisisonAfter = permissionsAfter.docs.pop().data();
    expect(permisisonAfter.roles[anotherOrgMember]).toEqual('superAdmin');
    expect(permisisonAfter.roles[testUser.uid]).toBe(undefined);

  });

  it('should clean organizations', async () => {
    const testUsers = [{ uid: 'A', email: 'A@fake.com' }, { uid: 'B', email: 'B@fake.com' }];

    const testOrgs = [
      { id: 'org-A', email: 'org-A@fake.com', members: [testUsers[0]], userIds: [testUsers[0].uid], movieIds: ['mov-A', 'mov-C'] },
      { id: 'org-B', email: 'org-B@fake.com', members: [testUsers[1]], userIds: [testUsers[1].uid, 'C'], movieIds: ['mov-A', 'mov-B'] }
    ];

    const testMovies = [{ id: 'mov-A' }, { id: 'mov-B' }];

    // Load our test set
    await populate('users', testUsers);
    await populate('orgs', testOrgs);
    await populate('movies', testMovies);


    const [users, organizationsBefore, movies] = await Promise.all([
      getCollectionRef('users'),
      getCollectionRef('orgs'),
      getCollectionRef('movies')
    ]);

    // Check if data have been correctly added
    expect(users.docs.length).toEqual(2);
    expect(organizationsBefore.docs.length).toEqual(2);
    expect(movies.docs.length).toEqual(2);

    const [movieIds, userIds] = [
      movies.docs.map(ref => ref.id),
      users.docs.map(ref => ref.id)
    ];

    await cleanOrganizations(organizationsBefore, userIds, movieIds);

    const organizationsAfter: Snapshot = await getCollectionRef('orgs');
    const cleanedOrgs = organizationsAfter.docs.filter(m => isOrgClean(m, userIds, movieIds)).length;
    expect(cleanedOrgs).toEqual(testOrgs.length);
  });

  it('should remove permissions not belonging to existing org', async () => {

    const testPermissions = [{ id: "org-A" }, { id: "org-B" }];
    const testOrgs = [{ id: "org-A" }];

    // Load our test set
    await populate('permissions', testPermissions);
    await populate('orgs', testOrgs);

    const [permissionsBefore, organizations] = await Promise.all([
      getCollectionRef('permissions'),
      getCollectionRef('orgs'),
    ]);

    // Check if data have been correctly added
    expect(permissionsBefore.docs.length).toEqual(2);
    expect(organizations.docs.length).toEqual(1);

    const organizationIds = organizations.docs.map(ref => ref.id);

    await cleanPermissions(permissionsBefore, organizationIds);
    const permissionsAfter: Snapshot = await getCollectionRef('permissions');
    expect(permissionsAfter.docs.length).toEqual(1);
    expect(permissionsAfter.docs[0].data().id).toEqual('org-A');
  });

  it('should clean movies from unwanted attributes', async () => {
    const testMovies = [{ id: 'mov-A' }, { id: 'mov-B', distributionRights: [] }, { id: 'mov-C' }];

    // Load our test set
    await populate('movies', testMovies);

    const moviesBefore: Snapshot = await getCollectionRef('movies');
    // Check if data have been correctly added
    expect(moviesBefore.docs.length).toEqual(3);

    await cleanMovies(moviesBefore);
    const moviesAfter: Snapshot = await getCollectionRef('movies');
    const cleanedMovies = moviesAfter.docs.filter(m => isMovieClean(m)).length;
    expect(cleanedMovies).toEqual(testMovies.length);
  });

  it('should remove documents undefined or not linked to existing document from docsIndex', async () => {

    const testDocsIndex = [{ id: 'undefined' }, { id: 'mov-A' }, { id: 'mov-C' }];

    const testMovies = [{ id: 'mov-A' }];

    // Load our test set
    await populate('movies', testMovies);
    await populate('docsIndex', testDocsIndex);

    const [docsIndexBefore, movies] = await Promise.all([
      getCollectionRef('docsIndex'),
      getCollectionRef('movies')
    ]);

    // Check if data have been correctly added
    expect(docsIndexBefore.docs.length).toEqual(3);
    expect(movies.docs.length).toEqual(1);

    const movieIds = movies.docs.map(m => m.id);

    await cleanDocsIndex(docsIndexBefore, movieIds);
    const docsIndexAfter: Snapshot = await getCollectionRef('docsIndex');
    expect(docsIndexAfter.docs.length).toEqual(1);
  });

  it('should delete notifications that are to old', async () => {
    const currentTimestamp = new Date().getTime() / 1000;
    const testNotifications = [
      {
        id: 'notif-A',
        toUserId: 'A',
        // Should be kept
        date: { _seconds: currentTimestamp },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'A' }
      },
      {
        id: 'notif-B',
        toUserId: 'A',
        // Just to the limit, should be kept
        date: { _seconds: 30 + currentTimestamp - (3600 * 24 * numberOfDaysToKeepNotifications) },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'A' }
      },
      {
        id: 'notif-C',
        toUserId: 'A',
        // Should be removed
        date: { _seconds: currentTimestamp - (3600 * 24 * (numberOfDaysToKeepNotifications + 1)) },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'A' }
      },
    ];

    const testUsers = [{ uid: 'A', email: 'A@fake.com' }];

    // Load our test set
    await populate('notifications', testNotifications);
    await populate('users', testUsers);

    const [notificationsBefore, users] = await Promise.all([
      getCollectionRef('notifications'),
      getCollectionRef('users')
    ]);

    // Check if data have been correctly added
    expect(notificationsBefore.docs.length).toEqual(3);
    expect(users.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id);

    await cleanNotifications(notificationsBefore, documentIds);
    const notificationsAfter: Snapshot = await getCollectionRef('notifications');

    expect(notificationsAfter.docs.length).toEqual(2);
  });

  it('should update notifications with related documents data', async () => {
    const currentTimestamp = new Date().getTime() / 1000;
    const testNotifications = [
      {
        id: 'notif-A',
        toUserId: 'A',
        date: { _seconds: currentTimestamp },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'A' }
      },
      {
        id: 'notif-B',
        toUserId: 'B',
        date: { _seconds: currentTimestamp },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'B' }
      },
      {
        id: 'notif-C',
        toUserId: 'B',
        date: { _seconds: currentTimestamp },
        type: 'organizationAcceptedByArchipelContent',
        organization: { id: 'org-A' }
      },
    ];

    const testUsers = [
      { uid: 'A', email: 'A@fake.com', watermark: createHostedMedia({ url: 'A.svg' }), avatar: createHostedMedia({ url: 'A.png' }) },
      { uid: 'B', email: 'B@fake.com', watermark: createHostedMedia({ url: 'B.svg' }), avatar: createHostedMedia({ url: 'B.png' }) }
    ];

    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com', logo: createHostedMedia({ url: 'org-A.svg' }) }];

    // Load our test set
    await populate('notifications', testNotifications);
    await populate('users', testUsers);
    await populate('orgs', testOrgs);

    const [notificationsBefore, users, orgs] = await Promise.all([
      getCollectionRef('notifications'),
      getCollectionRef('users'),
      getCollectionRef('orgs')
    ]);

    // Check if data have been correctly added
    expect(notificationsBefore.docs.length).toEqual(3);
    expect(users.docs.length).toEqual(2);
    expect(orgs.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id).concat(orgs.docs.map(d => d.id));

    await cleanNotifications(notificationsBefore, documentIds);
    const notificationsAfter: Snapshot = await getCollectionRef('notifications');

    const cleanOutput = notificationsAfter.docs.map(d => isNotificationClean(d));
    expect(every(cleanOutput)).toEqual(true);
  });

  it('should delete invitations to a deleted event and keep outdated but valids events', async () => {
    const currentTimestamp = new Date().getTime() / 1000;
    const testInvitations = [
      {
        id: 'invit-A',
        type: 'attendEvent',
        docId: 'event-C', // event-C does not exists, should be removed
        fromOrg: { id: 'org-A' },
        toUser: { uid: 'A' },
      },
      {
        id: 'invit-B',
        type: 'attendEvent',
        docId: 'event-B',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'A' },
      },
      {
        id: 'invit-C',
        type: 'attendEvent',
        docId: 'event-B',
        toOrg: { id: 'org-B' }, // org-B doest not exists, should be removed
        fromUser: { uid: 'A' },
      },
      {
        id: 'invit-D',
        type: 'attendEvent',
        docId: 'event-B',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'B' }, // B doest not exists, should be removed
      }
    ];

    const testEvents = [
      {
        id: 'event-B',
        // Outdated by 30 seconds, but should be kept since we keep old invitations to make some stats
        end: { _seconds: currentTimestamp - 30 },
      }
    ];

    const testUsers = [{ uid: 'A', email: 'A@fake.com' }];
    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com' }];

    // Load our test set
    await populate('invitations', testInvitations);
    await populate('events', testEvents);
    await populate('users', testUsers);
    await populate('orgs', testOrgs);

    const [invitationsBefore, events, users, orgs] = await Promise.all([
      getCollectionRef('invitations'),
      getCollectionRef('events'),
      getCollectionRef('users'),
      getCollectionRef('orgs')
    ]);

    // Check if data have been correctly added
    expect(invitationsBefore.docs.length).toEqual(4);
    expect(events.docs.length).toEqual(1);
    expect(users.docs.length).toEqual(1);
    expect(orgs.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id)
      .concat(events.docs.map(d => d.id))
      .concat(orgs.docs.map(d => d.id));


    await cleanInvitations(invitationsBefore, documentIds);
    const invitationsAfter: Snapshot = await getCollectionRef('invitations');

    expect(invitationsAfter.docs.length).toEqual(1);
    expect(invitationsAfter.docs[0].id).toEqual('invit-B');
  });

  it('should delete not pending joinOrganization invitations older than n days', async () => {
    const currentTimestamp = new Date().getTime() / 1000;
    const testInvitations = [
      {
        id: 'invit-A',
        status: 'pending',
        // Should be kept even if date is passed because of the pending status
        date: { _seconds: currentTimestamp - (3600 * 24 * (numberOfDaysToKeepNotifications + 1)) },
        type: 'joinOrganization',
        fromOrg: { id: 'org-A' },
        toUser: { uid: 'A' },
      },
      {
        id: 'invit-B',
        status: 'accepted',
        // Should be removed
        date: { _seconds: currentTimestamp - (3600 * 24 * (numberOfDaysToKeepNotifications + 1)) },
        type: 'joinOrganization',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'A' },
      },
      {
        id: 'invit-C',
        status: 'accepted',
        // Just to the limit, should be kept
        date: { _seconds: 30 + currentTimestamp - (3600 * 24 * numberOfDaysToKeepNotifications) },
        type: 'joinOrganization',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'A' },
      }
    ];

    const testUsers = [{ uid: 'A', email: 'A@fake.com' }];
    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com' }];

    // Load our test set
    await populate('invitations', testInvitations);
    await populate('users', testUsers);
    await populate('orgs', testOrgs);

    const [invitationsBefore, users, orgs] = await Promise.all([
      getCollectionRef('invitations'),
      getCollectionRef('users'),
      getCollectionRef('orgs')
    ]);

    // Check if data have been correctly added
    expect(invitationsBefore.docs.length).toEqual(3);
    expect(users.docs.length).toEqual(1);
    expect(orgs.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id).concat(orgs.docs.map(d => d.id));

    await cleanInvitations(invitationsBefore, documentIds);
    const invitationsAfter: Snapshot = await getCollectionRef('invitations');

    expect(invitationsAfter.docs.length).toEqual(2);
  });

  it('should update invitations with related documents data', async () => {
    const currentTimestamp = new Date().getTime() / 1000;

    const testInvitations = [
      {
        id: 'invit-A',
        status: 'pending',
        date: { _seconds: currentTimestamp },
        type: 'joinOrganization',
        fromOrg: { id: 'org-A' },
        toUser: { uid: 'A' },
      },
      {
        id: 'invit-B',
        status: 'accepted',
        date: { _seconds: currentTimestamp },
        type: 'joinOrganization',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'A' },
      },
      {
        id: 'invit-C',
        status: 'accepted',
        date: { _seconds: currentTimestamp },
        type: 'joinOrganization',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'B' },
      }
    ];

    const testUsers = [
      { uid: 'A', email: 'A@fake.com', watermark: createHostedMedia({ url: 'A.svg' }), avatar: createHostedMedia({ url: 'A.png' }) },
      { uid: 'B', email: 'B@fake.com', watermark: createHostedMedia({ url: 'B.svg' }), avatar: createHostedMedia({ url: 'B.png' }) }
    ];

    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com', logo: createHostedMedia({ url: 'org-A.svg' }) }];

    // Load our test set
    await populate('invitations', testInvitations);
    await populate('users', testUsers);
    await populate('orgs', testOrgs);

    const [invitationsBefore, users, orgs] = await Promise.all([
      getCollectionRef('invitations'),
      getCollectionRef('users'),
      getCollectionRef('orgs')
    ]);

    // Check if data have been correctly added
    expect(invitationsBefore.docs.length).toEqual(3);
    expect(users.docs.length).toEqual(2);
    expect(orgs.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id).concat(orgs.docs.map(d => d.id));

    await cleanInvitations(invitationsBefore, documentIds);
    const invitationsAfter: Snapshot = await getCollectionRef('invitations');

    const cleanOutput = invitationsAfter.docs.map(d => isInvitationClean(d));
    expect(every(cleanOutput)).toEqual(true);
  });

});

function isMovieClean(d: any) {
  return d.data().distributionRights === undefined;
}

function isOrgClean(doc: any, existingUserIds: string[], existingMovieIds: string[]) {
  const o = doc.data();
  if (o.members !== undefined) {
    return false;
  }

  const { userIds, movieIds } = o;
  const validUserIds = userIds.filter(userId => existingUserIds.includes(userId));

  if (validUserIds.length !== userIds.length) {
    return false;
  }

  const validMovieIds = movieIds.filter(movieId => existingMovieIds.includes(movieId));
  if (validMovieIds.length !== movieIds.length) {
    return false;
  }

  return true;
}

function isNotificationClean(doc: any) {
  const d = doc.data();
  if (d.user && (!d.user.avatar || !d.user.watermark)) {
    return false;
  }

  if (d.organization && !d.organization.logo) {
    return false;
  }

  const notificationTimestamp = d.date.toMillis();
  if (notificationTimestamp < new Date().getTime() - (dayInMillis * numberOfDaysToKeepNotifications)) {
    return false;
  }

  return true;
}

function isInvitationClean(doc: any) {
  const d = doc.data();
  if (d.fromOrg?.id && (!d.fromOrg.logo)) {
    return false;
  }

  if (d.toOrg?.id && (!d.toOrg.logo)) {
    return false;
  }

  if (d.fromUser?.uid && (!d.fromUser.avatar || !d.fromUser.watermark)) {
    return false;
  }

  if (d.toUser?.uid && (!d.toUser.avatar || !d.toUser.watermark)) {
    return false;
  }

  return true;
}

function isUserClean(doc: any, organizationIds: string[]) {
  const d = doc.data();
  if (d.surname !== undefined) { // old model
    return false;
  }

  if (d.name !== undefined) { // old model
    return false;
  }

  if (d.orgId && !organizationIds.includes(d.orgId)) {
    return false;
  }

  return true;
}