import * as plugins from './plugins';
import {
  getAuth,
  getAuthEmulator,
  getDb,
  getFirestoreEmulator,
  getStorageEmulator,
  getStorage
} from '@blockframes/firebase-utils/initialize';
import type { Firestore, Auth, Storage } from '@blockframes/firebase-utils/types';

export let db: Firestore;
export let auth: Auth;
export let storage: Storage;

export function testingCypress(config?: Cypress.PluginConfigOptions): Cypress.Tasks {
  console.log(config?.env);

  if (config && 'emulator' in config.env && config.env.emulator) {
    db = getFirestoreEmulator();
    auth = getAuthEmulator();
    storage = getStorageEmulator();
    console.log('Connected to emulator');
  } else {
    console.warn('WARNING - e2e tests no longer support running against live services and must be emulated');
    console.warn('These tests are trying to run against a live Firestore instance. Please fix config!');
    db = getDb();
    auth = getAuth();
    storage = getStorage();
    console.log('Connected to live Firestore dev server');
  }

  return plugins;
}
