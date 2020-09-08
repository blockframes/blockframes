// tslint:disable: no-console
import type * as admin from 'firebase-admin';

export async function deleteAllUsers(auth: admin.auth.Auth) {
  const allUsers: admin.auth.UserRecord[] = [];
  let result: any = { pageToken: undefined };

  console.log('Loading users now...');
  let timeMsg = 'Loading users took';
  console.time(timeMsg);
  do {
    result = await auth.listUsers(1000, result.pageToken);
    allUsers.push(...result.users);
  } while (result.pageToken);
  console.timeEnd(timeMsg);

  console.log('Starting user deletion...');
  timeMsg = `Deleting ${allUsers.length} users took`;
  console.time(timeMsg);

  const allUsersUids = allUsers.map((record) => record.uid);
  async function* iterateDeleteUsers(uids: string[]) {
    while (uids.length > 0) {
      const batch = uids.splice(0, 1000);
      yield auth.deleteUsers(batch);
    }
  }
  const delUsersIterator = iterateDeleteUsers(allUsersUids);
  const output = { errors: [], successCount: 0, failureCount: 0 };
  for await (const deletion of delUsersIterator) {
    const { errors, failureCount, successCount } = deletion;
    output.errors.push(errors);
    output.successCount += successCount;
    output.failureCount += failureCount;
  }
  console.timeEnd(timeMsg);
  return output;
}

export async function importAllUsers(auth: admin.auth.Auth, users: admin.auth.UserImportRecord[]) {
  const timeMsg = `Creating ${users.length} users took`;
  console.time(timeMsg);

  async function* iterateImportUsers(u: admin.auth.UserImportRecord[]) {
    while (u.length > 0) {
      const batch = u.splice(0, 1000);
      yield auth.importUsers(batch);
    }
  }
  const importUsersIterator = iterateImportUsers(users);
  const output = { errors: [], successCount: 0, failureCount: 0 };
  for await (const deletion of importUsersIterator) {
    const { errors, failureCount, successCount } = deletion;
    output.errors.push(errors);
    output.successCount += successCount;
    output.failureCount += failureCount;
  }
  console.timeEnd(timeMsg);
  return output;
}
