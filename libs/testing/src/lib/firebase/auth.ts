import { sleep } from '@blockframes/firebase-utils';
// tslint:disable: no-console
import type * as admin from 'firebase-admin';

export async function deleteAllUsers(auth: admin.auth.Auth) {
  let result: Partial<admin.auth.ListUsersResult> = { pageToken: undefined };

  console.log('Deleting users now...');
  const timeMsg = 'Deleting users took';
  console.time(timeMsg);
  do {
    result = await auth.listUsers(1000, result.pageToken);
    await auth.deleteUsers(result.users.map(record => record.uid))
  } while (result.pageToken);
  console.timeEnd(timeMsg);
}

export async function importAllUsers(auth: admin.auth.Auth, users: admin.auth.UserImportRecord[]) {
  const timeMsg = `Creating ${users.length} users took`;
  console.time(timeMsg);

  async function* iterateImportUsers(u: admin.auth.UserImportRecord[]) {
    while (u.length > 0) {
      const batch = u.splice(0, 1000);
      yield Promise.all(batch.map(userRecord => auth.createUser(userRecord)))
    }
  }
  const importUsersIterator = iterateImportUsers(users);
  let successCount = 0;
  for await (const deletion of importUsersIterator) {
    await sleep(1000)
    successCount += deletion.length;
  }
  console.timeEnd(timeMsg);
  return successCount;
}
