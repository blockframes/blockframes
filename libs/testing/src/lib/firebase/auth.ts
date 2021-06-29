import { runChunks, sleep } from '@blockframes/firebase-utils';
import * as env from '@env';
import type * as admin from 'firebase-admin';

export async function deleteAllUsers(auth: admin.auth.Auth) {
  let result: Partial<admin.auth.ListUsersResult> = { pageToken: undefined };

  console.log('Deleting users now...');
  const timeMsg = 'Deleting users took';
  console.time(timeMsg); // eslint-disable-line no-restricted-syntax
  do {
    result = await auth.listUsers(100, result.pageToken);
    await auth.deleteUsers(result.users.map(record => record.uid));
    await sleep(1000); // @see https://groups.google.com/u/1/g/firebase-talk/c/4VkOBKIsBxU
  } while (result.pageToken);
  console.timeEnd(timeMsg); // eslint-disable-line no-restricted-syntax
}

export async function importAllUsers(auth: admin.auth.Auth, users: admin.auth.UserImportRecord[]) {
  const timeMsg = `Creating ${users.length} users took`;
  console.time(timeMsg); // eslint-disable-line no-restricted-syntax
  const uniqUsers = removeDuplicateUsers(users);
  await runChunks(uniqUsers, userRecord => auth.createUser({ ...userRecord, emailVerified: true }), (env?.['chunkSize'] || 10) * 10);
  console.timeEnd(timeMsg); // eslint-disable-line no-restricted-syntax
}

function removeDuplicateUsers(users: admin.auth.UserImportRecord[]) {
  const output: admin.auth.UserImportRecord[] = [];
  for (const curUser of users) {
    if (output.some(user => user.email === curUser.email)) {
      console.log('Duplicate user email found:', curUser.email);
    } else {
      output.push(curUser)
    }
  }
  return output;
}
