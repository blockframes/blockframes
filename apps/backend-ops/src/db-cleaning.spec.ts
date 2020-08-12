import { auth, firestore, storage } from 'firebase-admin';
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

type Snapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
jest.setTimeout(30000);

describe('DB cleaning script', () => {
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
      promises.push(runChunks(sets[collection], async (d) => {
        const docRef = adminServices.db.collection(collection).doc(d.id || d.uid);
        if (d.date?._seconds) { d.date = new Date(d.date._seconds * 1000) };
        await docRef.set(d);
      }, 50, false));
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

    // @TODO #3066 make more tests here

    const usersAfter: Snapshot = await adminServices.db.collection('users').get();
    const cleanedUsers = usersAfter.docs.filter(u => isUserClean(u)).length;
    expect(2).toEqual(cleanedUsers);
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
    expect(orgsTestSet.length).toEqual(cleanedOrgs);
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
    expect(orgsToKeep).toEqual(permissionsAfter.docs.length);
  });

  it('should clean movies from unwanted attributes', async () => {
    const moviesBefore: Snapshot = await adminServices.db.collection('movies').get();
    await cleanMovies(moviesBefore);
    const moviesAfter: Snapshot = await adminServices.db.collection('movies').get();
    const cleanedMovies = moviesAfter.docs.filter(m => isMovieClean(m)).length;
    expect(moviesTestSet.length).toEqual(cleanedMovies);
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
    expect(docsToKeep).toEqual(docsIndexAfter.docs.length);
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

    await cleanNotifications(adminServices, notificationsBefore, documentIds);
    const notificationsAfter: Snapshot = await adminServices.db.collection('notifications').get();

    const cleanOutput = notificationsAfter.docs.map(d => isNotificationClean(d));
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

function isNotificationClean(d: any) {
  // @TODO (#3066) check also toUserId and user/org ?
  const notificationTimestamp = d.data().date.toMillis();
  if (notificationTimestamp < new Date().getTime() - (dayInMillis * numberOfDaysToKeepNotifications)) {
    return false;
  }

  return true;
}

function isUserClean(doc: any) {
  const d = doc.data();
  if (d.surname !== undefined) { // old model
    return false;
  }

  if (d.name !== undefined) {// old model
    return false;
  }

  return true;
}