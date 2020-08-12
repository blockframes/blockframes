import * as admin from 'firebase-admin';
import { differenceBy } from 'lodash';

export function getDocument<T>(path: string): Promise<T> {
  const db = admin.firestore();
  return db
    .doc(path)
    .get()
    .then(doc => doc.data() as T);
}

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export interface UserConfig {
  uid: string;
  email: string;
  password: string;

  [key: string]: any;
}

/**
 * Remove all users that are not in the list of expected users.
 *
 * @param expectedUsers
 * @param auth
 */
export async function removeUnexpectedUsers(expectedUsers: UserConfig[], auth: admin.auth.Auth): Promise<any> {
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
      await auth.deleteUser(user.uid);
      await sleep(100);
    }
  } while (pageToken);

  return;
}