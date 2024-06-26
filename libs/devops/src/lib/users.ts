/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { differenceBy } from 'lodash';
import readline from 'readline';
import { deleteAllUsers, importAllUsers } from '@blockframes/testing/unit-tests';
import * as env from '@env';
import { PublicUser, User, USER_FIXTURES_PASSWORD } from '@blockframes/model';
import { subMonths } from 'date-fns';
import { getAuth, getDb } from '@blockframes/firebase-utils/initialize';
import type { Auth, UpdateRequest, UserRecord } from '@blockframes/firebase-utils/types';
import { getCollectionInBatches, sleep } from '@blockframes/firebase-utils/util';
import { endMaintenance, startMaintenance } from '@blockframes/firebase-utils/maintenance';

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
export async function syncUsers({
  db = getDb(),
  auth = getAuth(),
  withMaintenance = false
}: {
  db?: FirebaseFirestore.Firestore;
  auth?: Auth;
  withMaintenance?: boolean
} = {}) {
  if (withMaintenance) await startMaintenance(db);
  const expectedUsers = await getUsersFromDb(db);
  await deleteAllUsers(auth);
  await importAllUsers(auth, expectedUsers);
  if (withMaintenance) await endMaintenance(db);
}

export async function printUsers() {
  const auth = getAuth();

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
  const db = getDb();
  const auth = getAuth();
  await startMaintenance(db);
  // clear users is equivalent to "we expect no users", we can reuse the code.
  await deleteAllUsers(auth);
  return endMaintenance(db);
}

export async function updateUsersPassword(emailPrefix: string, password: string, dryRun = true) {
  if (!emailPrefix) throw Error('Email prefix cannot be empty');
  if (!password || password.length < 6) throw Error('Password must be at least 6 characters long');
  if (dryRun) console.log('[WARNING] This is only a simulation, to actually run the command, add "execute".');
  if (dryRun) console.log(`New password is "${password}"`);

  const db = getDb();

  const allUsers = await getUsersFromDb(db);
  const matchingUids = allUsers.filter(u => u.email.includes(emailPrefix)).map(u => {
    console.log(`${u.email} - ${u.uid} password will be updated.`);
    return u.uid;
  });
  console.log(`Will update ${matchingUids.length} users`);
  return !dryRun ? updateUsers(matchingUids, { password }) : undefined;
}

async function updateUsers(uidsToUpdate: string[], properties: UpdateRequest) {
  const auth = getAuth();
  console.log('Updating users now...');
  const timeMsg = 'Updating users took';
  console.time(timeMsg); // eslint-disable-line no-restricted-syntax

  let cpt = 0;
  const uidsCount = uidsToUpdate.length;
  for (const uidToUpdate of uidsToUpdate) {
    cpt++;
    console.log(`[${cpt}/${uidsCount}] Updating ${uidToUpdate}`);
    await auth.updateUser(uidToUpdate, properties)
      .catch(e => console.log(`An error occured : ${e.message || 'unknown error'}`));
    await sleep(1000); // @see https://groups.google.com/u/1/g/firebase-talk/c/4VkOBKIsBxU
  }

  console.timeEnd(timeMsg); // eslint-disable-line no-restricted-syntax
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
  const db = getDb();
  const auth = getAuth();
  await startMaintenance(db);
  const users = await readUsersFromSTDIN();
  await createAllUsers(users, auth);
  return endMaintenance(db);
}
