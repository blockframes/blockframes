/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import request from 'request';
import { UserConfig, USERS } from './users.fixture';
import { Auth, loadAdminServices, UserRecord } from './admin';

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
    return await auth.createUser({ uid, email, password });
  }
}

/**
 * Create all users defined in the users.fixture file
 *
 * @param auth  Firestore Admin Auth object
 */
export async function createAllUsers(users: UserConfig[], auth: Auth): Promise<any> {
  const ps = users.map(user => createUserIfItDoesntExists(auth, user));
  return Promise.all(ps);
}

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export async function trashAllOtherUsers(
  expectedUsers: UserConfig[],
  auth: Auth,
  fromPageToken?: string
): Promise<any> {
  const expectedUsersIds = expectedUsers.map(x => x.uid);

  let { pageToken, users } = await auth.listUsers(1000, fromPageToken);

  while (users.length > 0) {
    const usersToRemove = users.filter(user => expectedUsersIds.indexOf(user.uid) === -1);

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
    } else {
      break; // Quick fix, looks like there was an API upgrade. Refactor.
    }
  }

  return;
}

function getRestoreURL(projectID: string): string {
  return `https://us-central1-${projectID}.cloudfunctions.net/admin/data/restore`;
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
    await trashAllOtherUsers(USERS, auth);
    console.info('done.');
  } catch (e) {
    console.error(e);
  }
}
