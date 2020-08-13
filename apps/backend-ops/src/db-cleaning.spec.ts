import { initFunctionsTestMock } from '@blockframes/testing/firebase/functions';
import { runChunks } from './tools';
import {
  cleanMovies,
  cleanOrganizations,
  cleanPermissions,
  cleanDocsIndex,
  cleanNotifications,
  dayInMillis,
  numberOfDaysToKeepNotifications,
  cleanUsers
} from './db-cleaning';
import { every } from 'lodash';
import { AdminAuthMocked } from '@blockframes/testing/firebase';
import { AdminServices, loadAdminServices } from './admin';
import moviesTestSet from '@blockframes/testing/mocked-data-unit-tests/movies.json';
import orgsTestSet from '@blockframes/testing/mocked-data-unit-tests/orgs.json';
import permissionsTestSet from '@blockframes/testing/mocked-data-unit-tests/permissions.json';
import docsIndexTestSet from '@blockframes/testing/mocked-data-unit-tests/docsIndex.json';
import notificationsTestSet from '@blockframes/testing/mocked-data-unit-tests/notifications.json';
import eventsTestSet from '@blockframes/testing/mocked-data-unit-tests/events.json';
import usersTestSet from '@blockframes/testing/mocked-data-unit-tests/users.json';
import { removeUnexpectedUsers } from './users';
import { UserConfig } from './assets/users.fixture';

type Snapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
jest.setTimeout(30000);


describe('Unit testing examples', () => {
  it('should instruct you how to test expected errors', async () => {
    try {
      throw Error('test error');
      // fail(); add fail to make sure that test did not pass because no error was raised
    } catch (err) {
      expect(err.message).toEqual('test error');
    }
  });
});

describe('DB cleaning script - global tests', () => {
  let adminServices: AdminServices;

  beforeAll(async () => {
    initFunctionsTestMock();
    adminServices = loadAdminServices();
    console.log('loading data..');
    const promises = [];
    const sets = {
      movies: moviesTestSet,
      orgs: orgsTestSet,
      permissions: permissionsTestSet,
      docsIndex: docsIndexTestSet,
      events: eventsTestSet,
      notifications: notificationsTestSet,
      users: usersTestSet
    };

    for (const collection in sets) {
      promises.push(populate(adminServices, collection, sets[collection]));
    }

    await Promise.all(promises);
  });

  it('should clean users by comparing auth and database', async () => {
    const [organizations, usersBefore] = await Promise.all([
      adminServices.db.collection('orgs').get(),
      adminServices.db.collection('users').get()
    ]);
    const organizationIds = organizations.docs.map(ref => ref.id);

    const adminAuth = new AdminAuthMocked() as any;
    await cleanUsers(usersBefore, organizationIds, adminAuth, adminServices.db);

    const usersAfter: Snapshot = await adminServices.db.collection('users').get();
    const cleanedUsers = usersAfter.docs.filter(u => isUserClean(u, organizationIds)).length;

    expect(cleanedUsers).toEqual(2);
  });

  it('should clean organizations', async () => {
    const [movies, organizationsBefore, users] = await Promise.all([
      adminServices.db.collection('movies').get(),
      adminServices.db.collection('orgs').get(),
      adminServices.db.collection('users').get()
    ]);

    const [movieIds, userIds] = [
      movies.docs.map(ref => ref.id),
      users.docs.map(ref => ref.id)
    ];

    await cleanOrganizations(organizationsBefore, userIds, movieIds);

    const organizationsAfter: Snapshot = await adminServices.db.collection('orgs').get();
    const cleanedOrgs = organizationsAfter.docs.filter(m => isOrgClean(m, userIds, movieIds)).length;
    expect(cleanedOrgs).toEqual(orgsTestSet.length);
  });

  it('should remove permissions not belonging to existing org', async () => {
    const [permissionsBefore, organizations,] = await Promise.all([
      adminServices.db.collection('permissions').get(),
      adminServices.db.collection('orgs').get(),
    ]);
    const organizationIds = organizations.docs.map(ref => ref.id);
    const orgsToKeep = permissionsBefore.docs.filter(d => organizationIds.includes(d.id)).length;

    await cleanPermissions(permissionsBefore, organizationIds);
    const permissionsAfter: Snapshot = await adminServices.db.collection('permissions').get();
    expect(permissionsAfter.docs.length).toEqual(orgsToKeep);
  });

  it('should clean movies from unwanted attributes', async () => {
    const moviesBefore: Snapshot = await adminServices.db.collection('movies').get();
    await cleanMovies(moviesBefore);
    const moviesAfter: Snapshot = await adminServices.db.collection('movies').get();
    const cleanedMovies = moviesAfter.docs.filter(m => isMovieClean(m)).length;
    expect(cleanedMovies).toEqual(moviesTestSet.length);
  });

  it('should remove documents undefined or not linked to existing document from docsIndex', async () => {
    const [docsIndexBefore, movies,] = await Promise.all([
      adminServices.db.collection('docsIndex').get(), // @TODO #3066 create collectionRef(path: string) method to factorize
      adminServices.db.collection('movies').get()
    ]);

    const movieIds = movies.docs.map(m => m.id);
    const docsToKeep = docsIndexBefore.docs.filter(d => movieIds.includes(d.id)).length;
    await cleanDocsIndex(docsIndexBefore, movieIds);
    const docsIndexAfter: Snapshot = await adminServices.db.collection('docsIndex').get();
    expect(docsIndexAfter.docs.length).toEqual(docsToKeep);
  });

  it('should clean notifications', async () => {
    const [notificationsBefore, events, movies, users] = await Promise.all([
      adminServices.db.collection('notifications').get(),
      adminServices.db.collection('events').get(),
      adminServices.db.collection('movies').get(),
      adminServices.db.collection('users').get()
    ]);

    const documentIds = movies.docs.map(m => m.id)
      .concat(events.docs.map(m => m.id))
      .concat(users.docs.map(m => m.id))

    await cleanNotifications(notificationsBefore, documentIds);
    const notificationsAfter: Snapshot = await adminServices.db.collection('notifications').get();

    const cleanOutput = notificationsAfter.docs.map(d => isNotificationClean(d));
    expect(every(cleanOutput)).toEqual(true);
  });
});


describe('DB cleaning script - deeper tests', () => {
  let adminServices: AdminServices;

  beforeAll(async () => {
    adminServices = loadAdminServices();
    // To be sure that tests are not polluted
    await resetDb(adminServices);
  });

  afterEach(async () => {
    // After each test, db is reseted
    await resetDb(adminServices);
  });

  it('should remove unexpected users from auth', async () => {
    const adminAuth = new AdminAuthMocked() as any;

    // Load our test set
    await populate(adminServices, 'users', usersTestSet);

    // Check if data have been correctly added
    const usersBefore = await adminServices.db.collection('users').get();
    expect(usersBefore.docs.length).toEqual(10);

    // Add a new auth user that is not on db
    const fakeAuthUser = { uid: 'abc123', email: 'test@abc123.com' };
    adminAuth.users.push(fakeAuthUser);

    const authBefore = await adminAuth.listUsers();
    expect(authBefore.users.length).toEqual(3);

    await removeUnexpectedUsers(usersBefore.docs.map(u => u.data() as UserConfig), adminAuth);

    // An user should have been removed from auth because it is not in DB.
    const authAfter = await adminAuth.listUsers();
    expect(authAfter.users.length).toEqual(2);

    // We check if the good user (abc123) have been removed.
    const user = await adminAuth.getUserByEmail(fakeAuthUser.email);
    expect(user).toEqual(undefined);

  });

  it('should smoothly delete an user that is not in auth', async () => {
    const adminAuth = new AdminAuthMocked() as any;

    // User with no orgId
    const testUser1 = { uid: '1M9DUDBATqayXXaXMYThZGtE9up1', email: 'bdelorme+users-392@cascade8.com' };
    // User with fake orgId
    const testUser2 = { uid: 'PlsmWeCu6WRIau8tWLFzkQTGe6F2', email: 'bdelorme+users-392@cascade8.com', orgId: 'fake-org-id' };

    // Set empty auth
    adminAuth.users = [];

    // Load our test set : only one user
    await populate(adminServices, 'users', [testUser1, testUser2]);

    // Check if users have been correctly added
    const usersBefore = await adminServices.db.collection('users').get();
    expect(usersBefore.docs.length).toEqual(2);

    await cleanUsers(usersBefore, [], adminAuth, adminServices.db);

    // Check if user have been correctly removed
    const usersAfter = await adminServices.db.collection('users').get();
    expect(usersAfter.docs.length).toEqual(0);

  });

  it('should update org and permissions documents when deleting user with org', async () => {
    const adminAuth = new AdminAuthMocked() as any;

    const testUser = { uid: '1M9DUDBATqayXXaXMYThZGtE9up1', email: 'bdelorme+users-392@cascade8.com', orgId: 'jnbHKBP5YLvRQGcyQ8In' };
    const anotherOrgMember = 'dVwUQoJy56Too7QkmwFSeplWf643';
    const testOrg = { id: testUser.orgId, userIds: [anotherOrgMember, testUser.uid] };
    const testPermission = { id: testUser.orgId, roles: { [testUser.uid]: 'admin', [anotherOrgMember]: 'superAdmin' } };

    // Set empty auth
    adminAuth.users = [];

    // Load our test set : only one user
    await populate(adminServices, 'users', [testUser]);
    // Loading a fake org belonging to user
    await populate(adminServices, 'orgs', [testOrg]);
    // Loading a fake permission document
    await populate(adminServices, 'permissions', [testPermission]);

    // Check if user have been correctly added
    const usersBefore = await adminServices.db.collection('users').get();
    expect(usersBefore.docs.length).toEqual(1);

    // Check if org have been correctly added
    const orgsBefore = await adminServices.db.collection('orgs').get();
    expect(orgsBefore.docs.length).toEqual(1);

    // Check permission org have been correctly added
    const permissionsBefore = await adminServices.db.collection('permissions').get();
    expect(permissionsBefore.docs.length).toEqual(1);

    await cleanUsers(usersBefore, [testOrg.id], adminAuth, adminServices.db);

    /** 
     * In this scenario, user should be removed from DB because it was not found in Auth (empty)
     * Since it is linked to an existing org, org and permissions documents should be updated
     * */

    // Check if user have been correctly removed
    const usersAfter = await adminServices.db.collection('users').get();
    expect(usersAfter.docs.length).toEqual(0);

    // Check if userId have been removed from org
    const orgsAfter = await adminServices.db.collection('orgs').get();
    const orgAfter = orgsAfter.docs.pop().data();
    expect(orgAfter.userIds.length).toEqual(1);
    expect(orgAfter.userIds[0]).toEqual(anotherOrgMember);

    // Check if permissions have been updated
    const permissionsAfter = await adminServices.db.collection('permissions').get();
    const permisisonAfter = permissionsAfter.docs.pop().data();
    expect(permisisonAfter.roles[anotherOrgMember]).toEqual('superAdmin');
    expect(permisisonAfter.roles[testUser.uid]).toBe(undefined);

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

function isNotificationClean(d: any) {
  // @TODO (#3066) check also toUserId and user/org ?
  const notificationTimestamp = d.data().date.toMillis();
  if (notificationTimestamp < new Date().getTime() - (dayInMillis * numberOfDaysToKeepNotifications)) {
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


////////////
// DB TOOLS
////////////

function populate(adminServices: AdminServices, collection: string, set: any[]) {
  return runChunks(set, async (d) => {
    const docRef = adminServices.db.collection(collection).doc(d.id || d.uid);
    if (d.date?._seconds) { d.date = new Date(d.date._seconds * 1000) };
    await docRef.set(d);
  }, 50, false)
}

async function resetDb(adminServices: AdminServices) {
  const collections = ['movies', 'orgs', 'permissions', 'docsIndex', 'notifications', 'events', 'users', 'invitations'];

  let documents = [];
  for (const collection of collections) {
    const docs = await adminServices.db.collection(collection).get();
    documents = documents.concat(docs.docs);
  }
  return runChunks(documents, async d => await d.ref.delete(), 50, false);
}