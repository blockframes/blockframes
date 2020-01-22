/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { UserConfig, USERS } from './assets/users.fixture';
import { differenceBy } from 'lodash';
import { Auth, loadAdminServices, UserRecord } from './admin';
import { sleep } from './tools';

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
async function createAllUsers(users: UserConfig[], auth: Auth): Promise<any> {
  const ps = users.map(user => createUserIfItDoesntExists(auth, user));
  return Promise.all(ps);
}

/**
 * Remove all users that are not in the list of expected users.
 *
 * @param expectedUsers
 * @param auth
 */
async function removeUnexpectedUsers(expectedUsers: UserConfig[], auth: Auth): Promise<any> {
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);

    const users = result.users;
    pageToken = result.pageToken;

    // users - expected users => users that we don't want in the database.
    const usersToRemove = differenceBy(users, expectedUsers, 'uid');

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

export async function syncUsers(): Promise<any> {
  const { auth } = loadAdminServices();
  const expectedUsers = USERS;
  await removeUnexpectedUsers(expectedUsers, auth);
  await createAllUsers(expectedUsers, auth);
}

export async function printUsers(): Promise<any> {
  const { auth } = loadAdminServices();

  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);
    const users = result.users;
    pageToken = result.pageToken;

    users.forEach(u => {
      console.log(JSON.stringify(u.toJSON()));
    });

  } while (pageToken);
}
