import * as firebaseConfig from 'firebase.json';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { firebase } from '@env';
import { getAuth as _getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage as _getStorage, Storage } from 'firebase-admin/storage';
import { apps, initializeApp, credential } from 'firebase-admin';
import { Credential, ServiceAccount } from 'firebase-admin/app';

export const SAK_KEY = 'GOOGLE_APPLICATION_CREDENTIALS';
/**
 * @dev instead of const SAK_VALUE = process.env[SAK_KEY] as string
 * a function is used to obtain new value when updateDotenv is called
 */
export const SAK_VALUE = () => process.env[SAK_KEY] as string;

interface ServiceAccountKey {
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
 */
export function initAdmin(...args: Parameters<typeof initializeApp>) {
  const [options, name = '[DEFAULT]'] = args;
  for (const app of apps) if (app?.name === name) return app;
  return initializeApp({ ...firebase(), credential: getCredentials(), ...options }, name);
}

function getCredentials(): Credential | undefined {
  try {
    const serviceAccount = JSON.parse(SAK_VALUE()) as ServiceAccount;
    return credential.cert(serviceAccount);
  } catch (e) {
    return credential.applicationDefault();
  }
}

export function getServiceAccountObj(GACValue: string): ServiceAccountKey {
  try {
    // If service account is a stringified json object
    return JSON.parse(GACValue);
  } catch (err) {
    // If service account is a path
    const file = readFileSync(resolve(GACValue), 'utf-8');
    if (!file) throw Error('SAK File not found!');
    return JSON.parse(file);
  }
}

/**
 * Makes sure Firebase is initialised and returns Firestore object
 */
export function getFirestoreEmulator(...args: Parameters<typeof initializeApp>): FirebaseFirestore.Firestore {
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

export function getAuthEmulator(...args: Parameters<typeof initializeApp>) {
  const port = firebaseConfig?.emulators?.auth?.port ?? 9099;
  process.env['FIREBASE_AUTH_EMULATOR_HOST'] = `localhost:${port}`;
  return getAuth(...args);
}

/**
 * Makes sure firebase app is initialised and returns Auth service
 */
export function getAuth(...args: Parameters<typeof initializeApp>): Auth {
  return _getAuth(initAdmin(...args));
}

/**
 * Makes sure Firebase is initialised and returns Firestore object
 */
export function getDb(...args: Parameters<typeof initializeApp>): FirebaseFirestore.Firestore {
  return getFirestore(initAdmin(...args));
}

/**
 * Makes sure firebase app is initialised and returns Storage service
 */
export function getStorage(...args: Parameters<typeof initializeApp>): Storage {
  return _getStorage(initAdmin(...args));
}

/**
 * Makes sure firebase app is initialised and returns emulated Storage service
 */
export function getStorageEmulator(...args: Parameters<typeof initializeApp>): Storage {
  const port = firebaseConfig?.emulators?.storage?.port ?? 9199;
  process.env['FIREBASE_STORAGE_EMULATOR_HOST'] = `localhost:${port}`;
  return _getStorage(initAdmin(...args));
}
