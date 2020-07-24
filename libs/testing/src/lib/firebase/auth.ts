import type * as admin from 'firebase-admin';

/**
 * deletes all users in Firebase Auth
 * @param auth the auth instance that you want to clear
 */
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

  const allUsersUids = allUsers.map(record => record.uid);
  async function* iterateDeleteUsers(uids: string[]) {
    while (uids.length > 0) {
      const batch = uids.splice(0, 10).map(uid => auth.deleteUser(uid).catch(console.warn))
      yield Promise.all(batch);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  const delUsersIterator = iterateDeleteUsers(allUsersUids);
  const output = { errors: [], successCount: 0, failureCount: 0 };
  for await (const deletion of delUsersIterator) {
    console.log('User deleted...')
    // // const { errors, failureCount, successCount } = deletion;
    // output.errors.push(errors);
    // output.successCount += successCount;
    // output.failureCount += failureCount;
  }
  // const promises: Promise<void>[] = [];
  // for (const record of allUsers) {
  //   const p = auth.deleteUser(record.uid);
  //   promises.push(p);
  // }
  // return Promise.all(promises).then(() => {
  console.timeEnd(timeMsg);
  // });
  return output;
}
