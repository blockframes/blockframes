import * as plugins from './plugins';
import type * as admin from 'firebase-admin';
import { getAuth, getAuthEmulator, getDb, getFirestoreEmulator } from '@blockframes/firebase-utils/initialize';

export let db: FirebaseFirestore.Firestore;
export let auth: admin.auth.Auth;

export function testingCypress(config?: Cypress.PluginConfigOptions): Cypress.Tasks {
  console.log(config.env);

  if ('emulator' in config.env && config.env.emulator) {
    db = getFirestoreEmulator();
    auth = getAuthEmulator();
    console.log('Connected to emulator');
  } else {
    console.warn('WARNING - e2e tests no longer support running against live services and must be emulated');
    console.warn('These tests are trying to run against a live Firestore instance. Please fix config!');
    db = getDb();
    auth = getAuth();
    console.log('Connected to live Firestore dev server');
  }

  return plugins;
}
