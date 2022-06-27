import * as admin from 'firebase-admin';
import * as firebaseConfig from 'firebase.json';
import { readFileSync } from 'fs';
import { join, resolve } from 'node:path';
import { firebase } from '@env';

export const SAK_KEY = 'GOOGLE_APPLICATION_CREDENTIALS';
export const SAK_VALUE = process.env[SAK_KEY] as string;
export const SAK_DIR = join('tools', 'credentials');

export interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Will ensure firebase app is initialised only once for a given name
 * @returns `void`
 */
export function initAdmin(...args: Parameters<typeof admin.initializeApp>) {
  const [options, name = '[DEFAULT]'] = args;
  for (const app of admin.apps) if (app?.name === name) return app;
  return admin.initializeApp({ ...firebase(), credential: getCredentials(), ...options }, name);
}

function getCredentials(): admin.credential.Credential | undefined {
  try {
    const serviceAccount = JSON.parse(SAK_VALUE) as admin.ServiceAccount;
    return admin.credential.cert(serviceAccount);
  } catch (e) {
    return admin.credential.applicationDefault();
  }
}

export function getServiceAccountObj(GACValue: string): ServiceAccountKey {
  try {
    // If service account is a stringified json object
    return JSON.parse(GACValue) as ServiceAccountKey;
  } catch (err) {
    // If service account is a path
    const file = readFileSync(resolve(GACValue), 'utf-8');
    if (!file) throw Error('SAK File not found!');
    return JSON.parse(file) as ServiceAccountKey;
  }
}

/**
 * Makes sure Firebase is initialised and returns Firestore object
 */
export function getFirestoreEmulator(...args: Parameters<typeof admin.initializeApp>): FirebaseFirestore.Firestore {
  const port = firebaseConfig?.emulators?.firestore?.port ?? 8080;
  process.env['FIRESTORE_EMULATOR_HOST'] = `localhost:${port}`;
  const db = getDb(...args);
  db?.settings({
    port,
    merge: true,
    ignoreUndefinedProperties: true,
    host: 'localhost',
    ssl: false,
  });
  return db;
}

export function getAuthEmulator(...args: Parameters<typeof admin.initializeApp>) {
  const port = firebaseConfig?.emulators?.auth?.port ?? 9099;
  process.env['FIREBASE_AUTH_EMULATOR_HOST'] = `localhost:${port}`;
  return getAuth(...args);
}

/**
 * Makes sure firebase app is initialised and returns Auth service
 */
export function getAuth(...args: Parameters<typeof admin.initializeApp>): admin.auth.Auth {
  return admin.auth(initAdmin(...args));
}

/**
 * Makes sure Firebase is initialised and returns Firestore object
 */
export function getDb(...args: Parameters<typeof admin.initializeApp>): FirebaseFirestore.Firestore {
  return admin.firestore(initAdmin(...args));
}

/**
 * Makes sure firebase app is initialised and returns Storage service
 */
export function getStorage(...args: Parameters<typeof admin.initializeApp>): admin.storage.Storage {
  return admin.storage(initAdmin(...args));
}

/**
 * Makes sure firebase app is initialised and returns emulated Storage service
 */
export function getStorageEmulator(...args: Parameters<typeof admin.initializeApp>): admin.storage.Storage {
  const port = firebaseConfig?.emulators?.storage?.port ?? 9199;
  process.env['FIREBASE_STORAGE_EMULATOR_HOST'] = `localhost:${port}`;
  return admin.storage(initAdmin(...args));
}
