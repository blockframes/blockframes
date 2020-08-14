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
import { loadAdminServices } from './admin';
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
let db: FirebaseFirestore.Firestore;

describe('DB cleaning script - global tests', () => {

  beforeAll(async () => {
    initFunctionsTestMock();
    const adminServices = loadAdminServices();
    db = adminServices.db;

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
      promises.push(populate(db, collection, sets[collection]));
    }

    await Promise.all(promises);
  });

  it('should clean users by comparing auth and database', async () => {
    const [organizations, usersBefore] = await Promise.all([
      db.collection('orgs').get(),
      db.collection('users').get()
    ]);
    const organizationIds = organizations.docs.map(ref => ref.id);

    const adminAuth = new AdminAuthMocked() as any;
    await cleanUsers(usersBefore, organizationIds, adminAuth, db);

    const usersAfter: Snapshot = await db.collection('users').get();
    const cleanedUsers = usersAfter.docs.filter(u => isUserClean(u, organizationIds)).length;

    expect(cleanedUsers).toEqual(2);
  });

  it('should clean organizations', async () => {
    const [movies, organizationsBefore, users] = await Promise.all([
      db.collection('movies').get(),
      db.collection('orgs').get(),
      db.collection('users').get()
    ]);

    const [movieIds, userIds] = [
      movies.docs.map(ref => ref.id),
      users.docs.map(ref => ref.id)
    ];

    await cleanOrganizations(organizationsBefore, userIds, movieIds);

    const organizationsAfter: Snapshot = await db.collection('orgs').get();
    const cleanedOrgs = organizationsAfter.docs.filter(m => isOrgClean(m, userIds, movieIds)).length;
    expect(cleanedOrgs).toEqual(orgsTestSet.length);
  });

  it('should remove permissions not belonging to existing org', async () => {
    const [permissionsBefore, organizations,] = await Promise.all([
      db.collection('permissions').get(),
      db.collection('orgs').get(),
    ]);
    const organizationIds = organizations.docs.map(ref => ref.id);
    const orgsToKeep = permissionsBefore.docs.filter(d => organizationIds.includes(d.id)).length;

    await cleanPermissions(permissionsBefore, organizationIds);
    const permissionsAfter: Snapshot = await db.collection('permissions').get();
    expect(permissionsAfter.docs.length).toEqual(orgsToKeep);
  });

  it('should clean movies from unwanted attributes', async () => {
    const moviesBefore: Snapshot = await db.collection('movies').get();
    await cleanMovies(moviesBefore);
    const moviesAfter: Snapshot = await db.collection('movies').get();
    const cleanedMovies = moviesAfter.docs.filter(m => isMovieClean(m)).length;
    expect(cleanedMovies).toEqual(moviesTestSet.length);
  });

  it('should remove documents undefined or not linked to existing document from docsIndex', async () => {
    const [docsIndexBefore, movies,] = await Promise.all([
      db.collection('docsIndex').get(), // @TODO #3066 create collectionRef(path: string) method to factorize
      db.collection('movies').get()
    ]);

    const movieIds = movies.docs.map(m => m.id);
    const docsToKeep = docsIndexBefore.docs.filter(d => movieIds.includes(d.id)).length;
    await cleanDocsIndex(docsIndexBefore, movieIds);
    const docsIndexAfter: Snapshot = await db.collection('docsIndex').get();
    expect(docsIndexAfter.docs.length).toEqual(docsToKeep);
  });

  it('should clean notifications', async () => {
    const [notificationsBefore, events, movies, users] = await Promise.all([
      db.collection('notifications').get(),
      db.collection('events').get(),
      db.collection('movies').get(),
      db.collection('users').get()
    ]);

    const documentIds = movies.docs.map(m => m.id)
      .concat(events.docs.map(m => m.id))
      .concat(users.docs.map(m => m.id))

    await cleanNotifications(notificationsBefore, documentIds);
    const notificationsAfter: Snapshot = await db.collection('notifications').get();

    const cleanOutput = notificationsAfter.docs.map(d => isNotificationClean(d));
    expect(every(cleanOutput)).toEqual(true);
  });
});


describe('DB cleaning script - deeper tests', () => {

  beforeAll(async () => {
    const adminServices = loadAdminServices();
    db = adminServices.db;
    // To be sure that tests are not polluted
    await resetDb(db);
  });

  afterEach(async () => {
    // After each test, db is reseted
    await resetDb(db);
  });

  it('should remove unexpected users from auth', async () => {
    const adminAuth = new AdminAuthMocked() as any;

    // Load our test set
    await populate(db, 'users', usersTestSet);

    // Check if data have been correctly added
    const usersBefore = await db.collection('users').get();
    expect(usersBefore.docs.length).toEqual(10);

    // Add a new auth user that is not on db
    const fakeAuthUser = { uid: 'A', email: 'johndoe@fake.com' };
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
    const testUser1 = { uid: 'A', email: 'johndoe@fake.com' };
    // User with fake orgId
    const testUser2 = { uid: 'B', email: 'johnmcclain@fake.com', orgId: 'fake-org-id' };

    // Set empty auth
    adminAuth.users = [];

    // Load our test set : only one user
    await populate(db, 'users', [testUser1, testUser2]);

    // Check if users have been correctly added
    const usersBefore = await db.collection('users').get();
    expect(usersBefore.docs.length).toEqual(2);

    await cleanUsers(usersBefore, [], adminAuth, db);

    // Check if user have been correctly removed
    const usersAfter = await db.collection('users').get();
    expect(usersAfter.docs.length).toEqual(0);

  });

  it('should update org and permissions documents when deleting user with org', async () => {
    const adminAuth = new AdminAuthMocked() as any;

    const testUser = { uid: 'A', email: 'johndoe@fake.com', orgId: 'orgA' };
    const anotherOrgMember = 'B';
    const testOrg = { id: testUser.orgId, userIds: [anotherOrgMember, testUser.uid] };
    const testPermission = { id: testUser.orgId, roles: { [testUser.uid]: 'admin', [anotherOrgMember]: 'superAdmin' } };

    // Set empty auth
    adminAuth.users = [];

    // Load our test set : only one user
    await populate(db, 'users', [testUser]);
    // Loading a fake org belonging to user
    await populate(db, 'orgs', [testOrg]);
    // Loading a fake permission document
    await populate(db, 'permissions', [testPermission]);

    // Check if user have been correctly added
    const usersBefore = await db.collection('users').get();
    expect(usersBefore.docs.length).toEqual(1);

    // Check if org have been correctly added
    const orgsBefore = await db.collection('orgs').get();
    expect(orgsBefore.docs.length).toEqual(1);

    // Check permission org have been correctly added
    const permissionsBefore = await db.collection('permissions').get();
    expect(permissionsBefore.docs.length).toEqual(1);

    await cleanUsers(usersBefore, [testOrg.id], adminAuth, db);

    /** 
     * In this scenario, user should be removed from DB because it was not found in Auth (empty)
     * Since it is linked to an existing org, org and permissions documents should be updated
     * */

    // Check if user have been correctly removed
    const usersAfter = await db.collection('users').get();
    expect(usersAfter.docs.length).toEqual(0);

    // Check if userId have been removed from org
    const orgsAfter = await db.collection('orgs').get();
    const orgAfter = orgsAfter.docs.pop().data();
    expect(orgAfter.userIds.length).toEqual(1);
    expect(orgAfter.userIds[0]).toEqual(anotherOrgMember);

    // Check if permissions have been updated
    const permissionsAfter = await db.collection('permissions').get();
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

function populate(db: FirebaseFirestore.Firestore, collection: string, set: any[]) {
  return runChunks(set, async (d) => {
    const docRef = db.collection(collection).doc(d.id || d.uid);
    if (d.date?._seconds) { d.date = new Date(d.date._seconds * 1000) };
    await docRef.set(d);
  }, 50, false)
}

async function resetDb(db: FirebaseFirestore.Firestore) {
  const collections = ['movies', 'orgs', 'permissions', 'docsIndex', 'notifications', 'events', 'users', 'invitations'];
  const promises = [];
  for (const collection of collections) {
    promises.push(db.collection(collection).get());
  }

  let docs = [];
  const result = await Promise.all(promises);
  result.forEach(res => { docs = docs.concat(res.docs) });

  return runChunks(docs, d => d.ref.delete(), 50, false);
}