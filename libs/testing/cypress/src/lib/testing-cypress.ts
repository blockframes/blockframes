// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as foo from 'cypress';
import { loadAdminServices } from '@blockframes/firebase-utils';
import { connectFirestoreEmulator, connectAuthEmulator } from '@blockframes/firebase-utils/firestore/emulator';
import type * as admin from 'firebase-admin';
import type { User } from '@blockframes/user/types';

// type cypressOnTask = (trigger: 'task', functionsObj: { [key: string]: (...args: any) => any }) => void;


let db: FirebaseFirestore.Firestore;
let auth: admin.auth.Auth;

function log(message: any) {
  typeof message === 'string' ? console.log(message) : console.dir(message);
  return message;
}

async function getRandomUID() {
  const user = await getRandomUser();
  const uid = user.uid;
  console.log(uid);
  return uid;
}

async function getRandomEmail() {
  const user = await getRandomUser();
  const email = user.email;
  console.log(email);
  return email;
}

async function getRandomUser() {
  /**
   * Look like is not random and options should be added to be able to get a random user for festival or catalog app for example
   * and right now you will always get 1M9DUDBATqayXXaXMYThZGtE9up1 that is blockframes admin.. Not a good practice
   */
  const userQuery = await db.collection('users').limit(1).get();
  const userSnap = userQuery.docs.pop();
  const user = userSnap.data() as User;
  console.log('Got random user:\n');
  console.dir(user);
  return user;
}

async function getUIDFromEmail(email: string) {
  const user = await auth.getUserByEmail(email);
  return user.uid;
}

async function createUserToken(uid: string) {
  /**
   * This is what is missing in token to be able to pass the rules
   * but this does not work..
   * @see isSignedIn() in firestore.rules
   **/
  const tokenPayLoad = {
    firebase: {
      sign_in_provider: 'password',
      identities: {}
    }
  };
  return await auth.createCustomToken(uid, tokenPayLoad);
}

export function testingCypress(config?: Cypress.PluginConfigOptions): Cypress.Tasks {
  console.log(config.env);

  if ('emulator' in config.env && config.env.emulator) {
    db = connectFirestoreEmulator();
    auth = connectAuthEmulator();
    console.log('Connected to emulator')
  } else {
    console.warn('WARNING - e2e tests no longer support running against live services and must be emulated');
    console.warn('These tests are trying to run against a live Firestore instance. Please fix config!');
    db = loadAdminServices().db;
    auth = loadAdminServices().auth;
    console.log('Connected to live Firestore dev server')
  }

  return {
    createUserToken,
    getRandomEmail,
    getUIDFromEmail,
    getRandomUID,
    log
  }
}
