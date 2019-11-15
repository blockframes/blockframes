/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import request from 'request';
import { UserConfig, USERS } from './users.fixture';
import { differenceBy } from 'lodash';
import { Auth, loadAdminServices, UserRecord } from './admin';

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

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
    console.log('trying to get user:', uid, email);
    // await here to catch the error in the try / catch scope
    return await auth.getUser(uid);
  } catch {
    console.log('creating user:', uid, email);
    return await auth.createUser({ uid, email, password });
  }
}

/**
 * Create all users defined in the users.fixture file
 *
 * @param users The list of users to create if they do not exists.
 * @param auth  Firestore Admin Auth object
 */
export async function createAllUsers(users: UserConfig[], auth: Auth): Promise<any> {
  const ps = users.map(user => createUserIfItDoesntExists(auth, user));
  return Promise.all(ps);
}

/**
 * Remove all users that are not in the list of expected users.
 *
 * @param expectedUsers
 * @param auth
 */
export async function removeUnexpectedUsers(expectedUsers: UserConfig[], auth: Auth): Promise<any> {
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);

    const users = result.users;
    pageToken = result.pageToken;

    console.log('PT:', pageToken);
    console.log('users:', users.map(x => x.uid));

    // users - expected users => users that we don't want in the database.
    const usersToRemove = differenceBy(users, expectedUsers, 'uid');

    console.log('usersToRemove:', usersToRemove.map(x => x.uid));

    // Note: this is usually bad practice to await in a loop.
    // In this VERY SPECIFIC case we just want to remove the user
    // and wait for some time to avoid exceeding Google's quotas.
    // This is "good enough", but do not reproduce in frontend / backend code.
    for (const user of usersToRemove) {
      console.log('removing user:', user.email, user.uid);
      await auth.deleteUser(user.uid);
      await sleep(100);
    }
  } while (pageToken);

  return;
}


function getRestoreURL(projectID: string): string {
  return `https://us-central1-${projectID}.cloudfunctions.net/admin/data/restore`;
}

export async function syncUsers(expectedUsers: UserConfig[]): Promise<any> {
  const { auth } = loadAdminServices();
  await removeUnexpectedUsers(expectedUsers, auth);
  await createAllUsers(expectedUsers, auth);
}

/**
 * Trigger a firestore database restore operation for the given project
 *
 * @param projectID
 */
export async function restore(projectID: string) {
  const url = getRestoreURL(projectID);

  // promisified request
  return new Promise((resolve, reject) => {
    request.post(url, (error, response) => {
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
  const { auth, firebaseConfig } = loadAdminServices();

  try {
    console.info('restoring...');
    await restore(firebaseConfig.projectId);
    console.info('done.');
  } catch (e) {
    console.error(e);
  }

  try {
    console.info('create all users...');
    await createAllUsers(USERS, auth);
    console.info('clearing other users...');
    await removeUnexpectedUsers(USERS, auth);
    console.info('done.');
  } catch (e) {
    console.error(e);
  }
}
