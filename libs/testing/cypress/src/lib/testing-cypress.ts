import { loadAdminServices } from '@blockframes/firebase-utils';
import { connectFirestoreEmulator, connectAuthEmulator } from '@blockframes/firebase-utils/firestore/emulator';
import * as plugins from './plugins';
import type * as admin from 'firebase-admin';

export let db: FirebaseFirestore.Firestore;
export let auth: admin.auth.Auth;

export function testingCypress(config?: Cypress.PluginConfigOptions): Cypress.Tasks {
  console.log(config.env);

  if ('emulator' in config.env && config.env.emulator) {
    db = connectFirestoreEmulator();
    auth = connectAuthEmulator();
    console.log('Connected to emulator');
  } else {
    console.warn('WARNING - e2e tests no longer support running against live services and must be emulated');
    console.warn('These tests are trying to run against a live Firestore instance. Please fix config!');
    db = loadAdminServices().db;
    auth = loadAdminServices().auth;
    console.log('Connected to live Firestore dev server');
  }

  return plugins;
}
