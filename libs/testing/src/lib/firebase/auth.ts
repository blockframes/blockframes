import { runChunks } from '@blockframes/firebase-utils';
import * as env from '@env';
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
  await runChunks(users, userRecord => auth.createUser(userRecord), (env?.['chunkSize'] || 10) * 10);
  console.timeEnd(timeMsg);
}
