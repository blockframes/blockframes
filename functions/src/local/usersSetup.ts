import * as admin from 'firebase-admin';
import request from 'request';
import { UserConfig, USERS } from './users';

type UserRecord = admin.auth.UserRecord;

const auth = admin.auth();

async function createUserIfItDoesntExists({ uid, email, password }: UserConfig): Promise<UserRecord> {
  try {
    // await here to catch the error in the try / catch scope
    return await auth.getUser(uid);
  } catch {
    return auth.createUser({ uid, email, password });
  }
}

export async function createAllUsers(): Promise<any> {
  return Promise.all(USERS.map(createUserIfItDoesntExists));
}

function getRestoreURL(projectID: string): string {
  return `https://us-central1-${projectID}.cloudfunctions.net/restoreFirestore`;
}

export async function restore(projectID: string) {
  const url = getRestoreURL(projectID);

  // promisified request
  return new Promise((resolve, reject) => {
    request(url, (error, response) => (
      error ? reject(error) : resolve(response)
    ));
  });
}
