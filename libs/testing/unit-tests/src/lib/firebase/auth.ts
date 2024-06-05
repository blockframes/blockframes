import { runChunks, sleep } from '@blockframes/firebase-utils';
import * as env from '@env';
import type { Auth, ListUsersResult, UserImportRecord } from 'firebase-admin/auth';

export async function deleteAllUsers(auth: Auth) {
  await deletedUsers(auth);
}

export async function deleteSelectedUsers(auth: Auth, uidToDelete: string[]) {
  if (!uidToDelete?.length) return;
  await deletedUsers(auth, uidToDelete);
}

async function deletedUsers(auth: Auth, uidToDelete: string[] = []) {
  let result: Partial<ListUsersResult> = { pageToken: undefined };

  console.log('Deleting users now...');
  const timeMsg = 'Deleting users took';
  console.time(timeMsg); // eslint-disable-line no-restricted-syntax
  do {
    result = await auth.listUsers(100, result.pageToken);
    const users = result.users.filter(record => uidToDelete?.length ? uidToDelete.includes(record.uid) : true);
    await auth.deleteUsers(users.map((record) => record.uid))
      .catch(e => console.log(`An error occured : ${e.message || 'unknown error'}`));
    await sleep(1000); // @see https://groups.google.com/u/1/g/firebase-talk/c/4VkOBKIsBxU
  } while (result.pageToken);
  console.timeEnd(timeMsg); // eslint-disable-line no-restricted-syntax
}

export async function importAllUsers(auth: Auth, users: UserImportRecord[]) {
  const timeMsg = `Creating ${users.length} users took`;
  console.time(timeMsg); // eslint-disable-line no-restricted-syntax
  const uniqUsers = removeDuplicateUsers(users);
  await runChunks(
    uniqUsers,
    (userRecord) => auth.createUser({ ...userRecord, emailVerified: true }),
    (env?.['chunkSize'] || 10) * 10
  );
  console.timeEnd(timeMsg); // eslint-disable-line no-restricted-syntax
}

function removeDuplicateUsers(users: UserImportRecord[]) {
  const output: UserImportRecord[] = [];
  for (const curUser of users) {
    if (output.some((user) => user.email === curUser.email)) {
      console.log('Duplicate user email found:', curUser.email);
    } else {
      output.push(curUser);
    }
  }
  return output;
}
