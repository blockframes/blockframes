import * as admin from 'firebase-admin';
import { firebase } from '@env';
import { firebase as firebaseCI } from 'env/env.blockframes-ci';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import requiredVars from 'tools/mandatory-env-vars.json';
import { OrganizationDocument } from '@blockframes/organization/+state/organization.model';
import { resolve } from 'path';
import { App } from '@blockframes/utils/apps';
import { connectEmulator } from './firestore';

/**
 * This function is an iterator that allows you to fetch documents from a collection in chunks
 * This is a generator, which means you should use `for await ()` syntax.
 * Make sure you output the iterator before iterating from the generator
 * @param ref the collection reference object
 * @param orderBy the unique key of the document object to order by
 * @param batchSize how many docs to fetch per iteration
 */
export async function* getCollectionInBatches<K>(ref: admin.firestore.CollectionReference, orderBy: string, batchSize = 650) {
  let querySnapshot = await ref.orderBy(orderBy).limit(batchSize).get();
  let lastSnapshot: FirebaseFirestore.QueryDocumentSnapshot | string = '';

  function getDocs(querySnap: FirebaseFirestore.QuerySnapshot) {
    return querySnap.docs.map((snap, i, arr) => {
      if (i === (arr.length - 1)) lastSnapshot = snap;
      return snap.data() as K;
    })
  }

  while (!querySnapshot.empty) {
    yield getDocs(querySnapshot);
    querySnapshot = await ref.orderBy(orderBy).startAfter(lastSnapshot).limit(batchSize).get()
  }
}

export interface DbRecord {
  docPath: string;
  content: { [key: string]: any };
}

export function readJsonlFile(dbBackupPath: string) {
  const file = readFileSync(dbBackupPath, 'utf-8');
  return file
    .split('\n')
    .filter((str) => !!str) // remove last line
    .map((str) => JSON.parse(str) as DbRecord);
}

let missingVarsMessageShown = false;

export function warnMissingVars(): void | never {
  if (process.env['PROJECT_ID'] !== firebase().projectId) {
    console.warn(
      'WARNING! Your PROJECT_ID in your shell environment does not match your'
      + 'Firebase project ID found in your Firebase configuration!'
      + 'Please use the "use" command to reset this unless you know what you\'re doing.'
      + '\nIf you are using a demo project ID for emulator, this is to be expected.'
    );
  }
  const warn = (key: string, msg: string) => {
    console.warn(`Please ensure the following variable is set in .env : ${key}`);
    console.warn(`More info: ${msg}\n`);
  };
  // Use '||' instead of '??' to detect empty string
  if (!missingVarsMessageShown) requiredVars.map(
    ({ key, msg }: { key: string; msg: string }) => process.env?.[key] || warn(key, msg)
  );
  missingVarsMessageShown = true;
}

export function catchErrors<T>(fn: (...args: any[]) => T): T | undefined {
  try {
    return fn();
  } catch (err) {
    if ('errors' in err) {
      err.errors.forEach((error: any) => console.error('ERROR:', error.message));
    } else {
      console.error(err);
    }
    return;
  }
}

export interface AdminServices {
  auth: admin.auth.Auth;
  db: admin.firestore.Firestore;
  storage: admin.storage.Storage;
  firebaseConfig: ReturnType<typeof firebase>;
  getCI: () => admin.app.App;
}

export function loadAdminServices(): AdminServices {
  config();

  if (!admin.apps.length) {
    admin.initializeApp({
      ...firebase(),
      credential: admin.credential.applicationDefault(),
    });
  }

  return {
    getCI,
    auth: admin.auth(),
    db: admin.firestore(),
    firebaseConfig: firebase(),
    storage: admin.storage(),
  };
}

let ci: admin.app.App;

function getCI() {
  if (!ci) {
    ci = admin.initializeApp(
      {
        projectId: firebaseCI().projectId,
        credential: admin.credential.applicationDefault(),
      },
      'CI-app'
    );
  }
  return ci;
}

export const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

export function getServiceAccountObj(keyFile: string): admin.ServiceAccount {
  try {
    // If service account is a stringified json object
    return JSON.parse(keyFile) as admin.ServiceAccount;
  } catch (err) {
    // If service account is a path
    // tslint:disable-next-line: no-eval
    return eval('require')(resolve(keyFile)) as admin.ServiceAccount;
  }
}

export async function hasAcceptedMovies(org: OrganizationDocument, appli: App) {
  const moviesColRef = await admin.firestore().collection('movies')
    .where('orgIds', 'array-contains', org.id).get();
  const movies = moviesColRef.docs.map(doc => doc.data());
  return movies.some(movie => movie?.app?.[appli].status === 'accepted' && movie?.app?.[appli].access);
}

export function throwOnProduction(): never | void {
  if (firebase().projectId === 'blockframes') throw Error('DO NOT RUN ON PRODUCTION!');
}
