/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { differenceBy } from 'lodash';
import { loadAdminServices, getCollectionInBatches, sleep } from '@blockframes/firebase-utils';
import readline from 'readline';
import { Auth, UserRecord, DbRecord } from '@blockframes/firebase-utils';
import { deleteAllUsers, importAllUsers } from '@blockframes/testing/firebase';
import * as env from '@env';
import { User } from '@blockframes/user/types';

export const { storageBucket } = env.firebase();

export interface UserConfig {
  uid: string;
  email: string;
  password: string;

  [key: string]: string | number;
}

export const USER_FIXTURES_PASSWORD = 'blockframes';

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
export async function removeUnexpectedUsers(expectedUsers: UserConfig[], auth: Auth) {
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);

    const users = result.users;
    pageToken = result.pageToken;

    // users - expected users => users that we don't want in the database.
    const usersToRemove = differenceBy(users, expectedUsers, 'uid', 'email');

    // Note: this is usually bad practice to await in a loop.
    // In this VERY SPECIFIC case we just want to remove the user
    // and wait for some time to avoid exceeding Google's quotas.
    // This is "good enough", but do not reproduce in frontend / backend code.
    for (const user of usersToRemove) {
      console.log('removing user:', user.email, user.uid);
    }
    await auth.deleteUsers(usersToRemove.map((user) => user.uid));
    await sleep(100);
  } while (pageToken);

  return;
}

function readUsersFromJsonlFixture(db: DbRecord[]): UserConfig[] {
  return db
    .filter((doc) => doc.docPath.includes('users/'))
    .filter((userDoc) => 'email' in userDoc.content)
    .map((userDoc) => ({
      uid: userDoc.content?.uid,
      email: userDoc.content?.email,
      password: USER_FIXTURES_PASSWORD,
    }));
}

async function getUsersFromDb(db: FirebaseFirestore.Firestore) {
  const usersIterator = getCollectionInBatches<User>(db.collection('users'), 'uid', 300);
  let output: UserConfig[] = [];
  for await (const users of usersIterator) {
    const password = USER_FIXTURES_PASSWORD;
    const outputChunk = users.map(({ uid, email }) => ({ uid, email, password }))
    output = output.concat(outputChunk);
  }
  return output;
}

/**
 * If `jsonl` param is not provided, the function will read users from local Firestore
 * @param jsonl optional Jsonl record array (usually from local db backup) to read users from
 */
export async function syncUsers(jsonl?: DbRecord[], db = loadAdminServices().db, auth = loadAdminServices().auth) {
  const expectedUsers = jsonl ? readUsersFromJsonlFixture(jsonl) : await getUsersFromDb(db);
  await deleteAllUsers(auth);
  const createResult = await importAllUsers(auth, expectedUsers);
  console.log(createResult);
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
