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
  const userQuery = await db.collection('users').limit(1).get();
  const userSnap = userQuery.docs.pop();
  const uid = userSnap.id;
  console.log(uid);
  return uid;
}

async function getRandomUser() {
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
  return await auth.createCustomToken(uid);
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
    getRandomUser,
    getUIDFromEmail,
    getRandomUID,
    log
  }
}
