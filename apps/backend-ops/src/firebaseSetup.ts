/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import * as admin from 'firebase-admin';
import request from 'request';
import { UserConfig, USERS } from './users.fixture';
import { firebase } from './environments/environment';

type UserRecord = admin.auth.UserRecord;
type Auth = admin.auth.Auth;

/**
 * @param auth  Firestore Admin Auth object
 * @param uid
 * @param email
 * @param password
 */
async function createUserIfItDoesntExists(
  auth: Auth,
  { uid, email, password }: UserConfig
): Promise<UserRecord> {
  try {
    // await here to catch the error in the try / catch scope
    return await auth.getUser(uid);
  } catch {
    return auth.createUser({ uid, email, password });
  }
}

/**
 * Create all users defined in the users.fixture file
 *
 * @param auth  Firestore Admin Auth object
 */
async function createAllUsers(auth: Auth): Promise<any> {
  const ps = USERS.map(user => createUserIfItDoesntExists(auth, user));
  return Promise.all(ps);
}

function getRestoreURL(projectID: string): string {
  return `https://us-central1-${projectID}.cloudfunctions.net/restoreFirestore`;
}

/**
 * Trigger a firestore database restore operation for the given project
 *
 * @param projectID
 */
async function restore(projectID: string) {
  const url = getRestoreURL(projectID);

  // promisified request
  return new Promise((resolve, reject) => {
    request(url, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Prepare the project's database & users,
 * run this before testing.
 *
 * TODO: we should be able to disable this operation during certain tests, use an env variable for example.
 */
export async function prepareFirebase() {
  admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount),
    credential: admin.credential.applicationDefault(),
    databaseURL: firebase.databaseURL
  });

  const auth = admin.auth();

  try {
    console.info('restoring...');
    await restore(firebase.projectId);
    console.info('done.');
  } catch (e) {
    console.error(e);
  }

  try {
    console.info('create all users...');
    await createAllUsers(auth);
    console.info('done.');
  } catch (e) {
    console.error(e);
  }
}
