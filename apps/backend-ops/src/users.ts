/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { UserConfig, USERS } from './assets/users.fixture';
import { differenceBy } from 'lodash';
import { Auth, loadAdminServices, UserRecord } from './admin';
import { sleep } from './tools';
import readline from 'readline';

/**
 * @param auth  Firestore Admin Auth object
 * @param userConfig
 */
async function createUserIfItDoesntExists(auth: Auth, userConfig: UserConfig): Promise<UserRecord> {
  const { uid, email } = userConfig;
  try {
    console.log('trying to get user:', uid, email);
    // await here to catch the error in the try / catch scope
    return await auth.getUser(uid);
  } catch {
    console.log('creating user:', uid, email);
    return await auth.createUser(userConfig);
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

export async function clearUsers(): Promise<any> {
  const { auth } = loadAdminServices();

  // clear users is equivalent to "we expect no users", we can reuse the code.
  return removeUnexpectedUsers([], auth);
}

function readUsersFromSTDIN(): Promise<UserConfig[]> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  // We push all the users from stdin to this array.
  // Later use a worker queue or a generator.
  const users = [];
  let failed = false;

  return new Promise((resolve, reject) => {
    // read the lines sent from stdin and parse them as JSON.
    // on error, toggle the `failed' flag and ignore all lines, we're going to exit.
    rl.on('line', line => {
      if (failed || line === '') {
        return;
      }

      try {
        users.push(JSON.parse(line));
      } catch (error) {
        reject(error);
        failed = true;
        rl.close();
        return;
      }
    });

    rl.on('close', async () => {
      if (failed) {
        return;
      }

      // When stdin gets closed
      resolve(users);
    });
  });
}

export async function createUsers(): Promise<any> {
  const { auth } = loadAdminServices();
  const users = await readUsersFromSTDIN();
  const usersWithPassword = users.map(user => ({ ...user, password: 'password' }));
  return createAllUsers(usersWithPassword, auth);
}
