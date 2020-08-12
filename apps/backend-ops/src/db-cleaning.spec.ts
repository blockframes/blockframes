import { auth, firestore, storage } from 'firebase-admin';
import { initFunctionsTestMock } from '../../../libs/testing/src/lib/firebase/functions';
import { runChunks } from './tools';
import {
  cleanMovies,
  cleanOrganizations,
  cleanPermissions,
  cleanDocsIndex,
  cleanNotifications,
  dayInMillis,
  numberOfDaysToKeepNotifications
} from './db-cleaning';
import { every } from 'lodash';
import { AdminServices } from './admin';

const moviesTestSet = require('../../../libs/testing/src/lib/mocked-data-unit-tests/movies.json'); // @TODO (#3066) commit this file only when fully anonymised
const orgsTestSet = require('../../../libs/testing/src/lib/mocked-data-unit-tests/orgs.json');// @TODO (#3066) commit this file only when fully anonymised
const permissionsTestSet = require('../../../libs/testing/src/lib/mocked-data-unit-tests/permissions.json');
// const docsIndexTestSet = require('../../../libs/testing/src/lib/mocked-data-unit-tests/docsIndex.json');
// const notificationsTestSet = require('../../../libs/testing/src/lib/mocked-data-unit-tests/notifications.json'); // @TODO (#3066) commit this file only when fully anonymised
// const eventsTestSet = require('../../../libs/testing/src/lib/mocked-data-unit-tests/2020-07-20T22 00 20.378Z-anonymised-mocked-events.json'); // @TODO (#3066) commit this file only when fully anonymised
// const usersTestSet = require('../../../libs/testing/src/lib/mocked-data-unit-tests/users.json');

let db;
jest.setTimeout(30000);

describe('DB cleaning script', () => {
  let adminServices: AdminServices;

  beforeAll(async () => {
    const featList = initFunctionsTestMock();
    adminServices = {
      auth: auth(), 
      db: firestore(),
      storage: storage(),
      firebaseConfig: featList.firebaseConfig
    };
    //db = firestore();

    console.log('loading movies data set...');
    await runChunks(moviesTestSet, async (d) => {
      const docRef = adminServices.db.collection('movies').doc(d.id);
      await docRef.set(d);
    }, 50, false);

    console.log('loading orgs data set...');
    await runChunks(orgsTestSet, async (d) => {
      const docRef = adminServices.db.collection('orgs').doc(d.id);
      await docRef.set(d);
    }, 50, false);

    console.log('loading permissions data set...');
    await runChunks(permissionsTestSet, async (d) => {
      const docRef = adminServices.db.collection('permissions').doc(d.id);
      await docRef.set(d);
    }, 50, false);

    /*
    console.log('loading docsIndex data set...');
    await runChunks(docsIndexTestSet, async (d) => {
      const docRef = adminServices.db.collection('docsIndex').doc(d.id);
      await docRef.set(d);
    }, 50, false);

    console.log('loading notifications data set...');
    await runChunks(notificationsTestSet, async (d) => {
      const docRef = adminServices.db.collection('notifications').doc(d.id);
      if (d.date._seconds) { d.date = new Date(d.date._seconds * 1000) }
      await docRef.set(d);
    }, 50, false);

    console.log('loading events data set...');
    await runChunks(eventsTestSet, async (d) => {
      const docRef = adminServices.db.collection('events').doc(d.id);
      await docRef.set(d);
    }, 50, false);

    console.log('loading users data set...');
    await runChunks(usersTestSet, async (d) => {
      const docRef = adminServices.db.collection('users').doc(d.uid);
      await docRef.set(d);
    }, 50, false);
    */

  });

  it.skip('should clean users by comparing auth and database', async () => {
    // @TODO (#3066) firebase-emulator does not allow this (it uses remote db)
    // await cleanUsers(users, organizationIds, auth, db);
    // @TODO (#3066 Mano) can you share a snippet for this ?
  });

  it('should clean organizations', async () => {
    const [movies, organizationsBefore, users] = await Promise.all([
      adminServices.db.collection('movies').get(),
      adminServices.db.collection('orgs').get(),
      adminServices.db.collection('users').get()
    ]);

    const [movieIds, userIds] = [
      movies.docs.map(movie => movie.data().id),
      users.docs.map(user => user.data().uid)
    ];

    await cleanOrganizations(organizationsBefore, userIds, movieIds);

    const organizationsAfter: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await adminServices.db.collection('orgs').get();
    const cleanedOrgs = organizationsAfter.docs.filter(m => isOrgClean(m, userIds, movieIds)).length;
    expect(orgsTestSet.length).toEqual(cleanedOrgs);
  });

  it('should remove permissions not belonging to existing org', async () => {
    const [permissionsBefore, organizations,] = await Promise.all([
      adminServices.db.collection('permissions').get(),
      adminServices.db.collection('orgs').get(),
    ]);
    const organizationIds = organizations.docs.map(organization => organization.data().id);
    const orgsToKeep = permissionsBefore.docs.filter(d => organizationIds.includes(d.id)).length;

    await cleanPermissions(permissionsBefore, organizationIds);
    const permissionsAfter: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await adminServices.db.collection('permissions').get();
    expect(orgsToKeep).toEqual(permissionsAfter.docs.length);
  });

  it('should clean movies from unwanted attributes', async () => {
    const moviesBefore: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await adminServices.db.collection('movies').get();
    await cleanMovies(moviesBefore);
    const moviesAfter: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await adminServices.db.collection('movies').get();
    const cleanedMovies = moviesAfter.docs.filter(m => isMovieClean(m)).length;
    expect(moviesTestSet.length).toEqual(cleanedMovies);
  });
  it('should remove documents undefined or not linked to existing document from docsIndex', async () => {
    const [docsIndexBefore, movies,] = await Promise.all([
      adminServices.db.collection('docsIndex').get(),
      adminServices.db.collection('movies').get()
    ]);

    const movieIds = movies.docs.map(m => m.id);
    const docsToKeep = docsIndexBefore.docs.filter(d => movieIds.includes(d.id)).length;
    await cleanDocsIndex(docsIndexBefore, movieIds);
    const docsIndexAfter: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await adminServices.db.collection('docsIndex').get();
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
    const notificationsAfter: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await adminServices.db.collection('notifications').get();

    const cleanOutput = notificationsAfter.docs.map(d => isNotificationClean(d));
    expect(every(cleanOutput)).toEqual(true);
  });
});

function isMovieClean(d: any) {
  return d.data().distributionRights === undefined;
}

function isOrgClean(doc: any, existingUserIds: string[], existingMovieIds: string[]) {
  const o = doc.data();
  if (o.members != undefined) {
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

function isNotificationClean(d) {
  // @TODO (#3066) check also toUserId and user/org
  const notificationTimestamp = d.data().date.toMillis();
  if (notificationTimestamp < new Date().getTime() - (dayInMillis * numberOfDaysToKeepNotifications)) {
    return false;
  }

  return true;
}