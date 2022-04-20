/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { differenceBy } from 'lodash';
import { loadAdminServices, getCollectionInBatches, sleep } from '@blockframes/firebase-utils';
import readline from 'readline';
import { Auth, UserRecord } from '@blockframes/firebase-utils';
import { deleteAllUsers, importAllUsers } from '@blockframes/testing/unit-tests';
import * as env from '@env';
import { PublicUser, User } from '@blockframes/model';
import { USER_FIXTURES_PASSWORD } from '@blockframes/firebase-utils/anonymize/util';
import { subMonths } from 'date-fns';

export const { storageBucket } = env.firebase();

interface UserConfig {
  uid: string;
  email: string;
  password: string;

  [key: string]: string | number;
}

/**
 * @param auth  Firestore Admin Auth object
 * @param userConfig
 */
async function createUserIfNonexistent(auth: Auth, userConfig: UserConfig): Promise<UserRecord> {
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
async function createAllUsers(users: UserConfig[], auth: Auth) {
  const ps = users.map((user) => createUserIfNonexistent(auth, user));
  return Promise.all(ps);
}

/**
 * Remove all users that are not in the list of expected users.
 *
 * @param expectedUsers
 * @param auth
 */
export async function removeUnexpectedUsers(expectedUsers: PublicUser[], auth: Auth, options = { dryRun: false }) {
  let pageToken;
  const now = new Date();
  const threeMonthsAgo = subMonths(now, 3);

  do {
    const result = await auth.listUsers(1000, pageToken);

    // Anonymous users filtering
    const users = result.users.filter(u => u.providerData.length !== 0);
    pageToken = result.pageToken;

    // Anonymous user creation time is older than 3 months and did not connected since
    const anonymousUsers = result.users.filter(u => u.providerData.length === 0);
    const anonymousUsersToRemove = anonymousUsers.filter(authUser => {
      const creationTimeTimestamp = Date.parse(authUser.metadata.creationTime);
      // Anonymous user was created more than 3 months ago
      if (creationTimeTimestamp < threeMonthsAgo.getTime()) {
        // User never connected, this case should never occur
        if (!authUser.metadata.lastSignInTime) return true;

        // User have not signed in within the last 3 months
        const lastSignInTime = Date.parse(authUser.metadata.lastSignInTime);
        if (lastSignInTime < threeMonthsAgo.getTime()) return true;
      }

      return false;
    });

    // users - expected users => users that we don't want in the database.
    const usersToRemove = differenceBy(users, expectedUsers, 'uid', 'email').concat(anonymousUsersToRemove);

    // Note: this is usually bad practice to await in a loop.
    // In this VERY SPECIFIC case we just want to remove the user
    // and wait for some time to avoid exceeding Google's quotas.
    // This is "good enough", but do not reproduce in frontend / backend code.
    for (const user of usersToRemove) {
      console.log(`removing ${user.providerData.length ? 'regular' : 'anonymous'} user ${user.email} (${user.uid})`);
    }
    if (!options.dryRun) await auth.deleteUsers(usersToRemove.map((user) => user.uid));
    await sleep(100);
  } while (pageToken);

  return;
}

async function getUsersFromDb(db: FirebaseFirestore.Firestore) {
  const usersIterator = getCollectionInBatches<User>(db.collection('users'), 'uid', 300);
  let output: UserConfig[] = [];
  for await (const users of usersIterator) {
    const password = USER_FIXTURES_PASSWORD;
    const outputChunk = users.map(({ uid, email }) => ({ uid, email, password }));
    output = output.concat(outputChunk);
  }
  return output;
}

/**
 * Read users from local Firestore
 * and creates them in Auth
 */
export async function syncUsers(db = loadAdminServices().db, auth = loadAdminServices().auth) {
  const expectedUsers = await getUsersFromDb(db);
  await deleteAllUsers(auth);
  await importAllUsers(auth, expectedUsers);
}

export async function printUsers() {
  const { auth } = loadAdminServices();

  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);
    const users = result.users;
    pageToken = result.pageToken;

    users.forEach((u) => {
      console.log(JSON.stringify(u.toJSON()));
    });
  } while (pageToken);
}

export async function clearUsers() {
  const { auth } = loadAdminServices();

  // clear users is equivalent to "we expect no users", we can reuse the code.
  return deleteAllUsers(auth);
}

function readUsersFromSTDIN(): Promise<UserConfig[]> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  // We push all the users from stdin to this array.
  // Later use a worker queue or a generator.
  const users = [];
  let failed = false;

  return new Promise((resolve, reject) => {
    // read the lines sent from stdin and parse them as JSON.
    // on error, toggle the `failed' flag and ignore all lines, we're going to exit.
    rl.on('line', (line) => {
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

export async function createUsers() {
  const { auth } = loadAdminServices();
  const users = await readUsersFromSTDIN();
  return createAllUsers(users, auth);
}
