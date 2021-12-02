// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as foo from 'cypress';
import { connectFirestoreEmulator, loadAdminServices } from '@blockframes/firebase-utils'
import type { User } from '@blockframes/user/types';

// type cypressOnTask = (trigger: 'task', functionsObj: { [key: string]: (...args: any) => any }) => void;



let db: FirebaseFirestore.Firestore;

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

export function testingCypress(config?: Cypress.PluginConfigOptions) : Cypress.Tasks {
  console.log(config.env);

  if ('emulator' in config.env && config.env.emulator) db = connectFirestoreEmulator();
  else db = loadAdminServices().db;

  return {
    getRandomUID,
    log
  }
}
