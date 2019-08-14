/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import * as admin from 'firebase-admin';
import request from 'request';
import { UserConfig, USERS, USERS_IDS } from './users.fixture';
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
    console.log('trying to get user:', uid, email);
    return await auth.getUser(uid);
  } catch {
    console.log('creating user:', uid, email);
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

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

async function trashAllOtherUsers(auth: Auth, fromPageToken?: string): Promise<any> {
  let { pageToken, users } = await auth.listUsers(1000, fromPageToken);

  while (users.length > 0 && pageToken) {
    const usersToRemove = users.filter(user => USERS_IDS.indexOf(user.uid) === -1);

    // Note: this is bad practice to await in a loop.
    // In that case we just want to remove the users and wait for some
    // time to avoid exploding Google's quotas. No need for more design,
    // but do not reproduce in frontend / backend code.
    for (const user of usersToRemove) {
      console.log('removing user:', user.email, user.uid);
      await auth.deleteUser(user.uid);
      await sleep(100);
    }

    if (pageToken) {
      const rest = await auth.listUsers(1000, pageToken);
      pageToken = rest.pageToken;
      users = rest.users;
    }
  }

  return;
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
    console.info('create all expected users...');
    await createAllUsers(auth);
    console.info('clearing other users...');
    await trashAllOtherUsers(auth);
    console.info('done.');
  } catch (e) {
    console.error(e);
  }
}
