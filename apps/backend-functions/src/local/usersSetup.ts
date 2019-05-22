// import * as firebase from 'firebase';
import * as admin from 'firebase-admin';
import request from 'request';
import { UserConfig, USERS } from './users';
// import * as env from './env';

type UserRecord = admin.auth.UserRecord;

// console.log('firebase');
// firebase.initializeApp(env.firebase);
// console.log('/firebase');

console.log('auth');
admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount),
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://blockframes-laurent.firebaseio.com'
});
console.log('/auth');

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
    request(url, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

async function run() {
  try {
    console.info('restoring...');
    await restore('blockframes-laurent');
    console.info('done.');
  } catch (e) {
    console.error(e);
  }

  try {
    console.info('create all users...');
    await createAllUsers();
    console.info('done.');
  } catch (e) {
    console.error(e);
  }
}

run();
