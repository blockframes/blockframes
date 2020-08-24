import * as tasks from './tasks';
import type * as foo from 'cypress';
import { firebase as firebaseTest } from '@env';
import * as admin from 'firebase-admin';

export let db: FirebaseFirestore.Firestore;
export let auth: admin.auth.Auth;
export let sentinel: typeof admin.firestore.FieldValue;

function setupRemoteEnv() {
  const app = admin.initializeApp({
    // ! Mano - error might be here
    credential: admin.credential.applicationDefault(),
    projectId: firebaseTest.projectId,
  });
  auth = app.auth();
  db = app.firestore();
  sentinel = admin.firestore.FieldValue;
}

/**
 * This function will return an object of Cypress tasks, after
 * processing the current testing env from `config`.
 * @param config the Cypress plugin file config object
 */
export function getCypressTasks(config: Cypress.PluginConfigOptions): Cypress.Tasks {
  setupRemoteEnv();
  // * Use this function to set up environment for tasks in future
  // * For example, you can read env config from `config` and do a setup here
  return tasks;
}
