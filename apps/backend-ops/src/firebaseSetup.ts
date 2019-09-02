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
    return await auth.getUser(uid);
  } catch {
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
    console.info('done.');
  } catch (e) {
    console.error(e);
  }
}
