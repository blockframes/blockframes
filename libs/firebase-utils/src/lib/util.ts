import * as admin from 'firebase-admin';
import { firebase } from '@env';
import { firebase as firebaseCI } from 'env/env.blockframes-ci';
import { config } from 'dotenv';
import requiredVars from 'tools/mandatory-env-vars.json';
import { resolve } from 'path';
import { App } from '@blockframes/utils/apps';
import { OrganizationDocument } from '@blockframes/model';

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
    ({ key, msg }: { key: string; msg: string }) => process.env?.[key] || warn(key, msg) // TODO #7858 warnMissingVars should check for prefixed env vars
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

/**
 * Removes all one-depth subcollections
 * @param snapshot
 * @param batch
 */
export async function removeAllSubcollections(
  snapshot: FirebaseFirestore.DocumentSnapshot,
  batch: FirebaseFirestore.WriteBatch,
  db = admin.firestore(),
  options = { verbose: true }
): Promise<FirebaseFirestore.WriteBatch> {
  if (options.verbose) console.log(`starting deletion of ${snapshot.ref.path} sub-collections`);
  const subCollections = await snapshot.ref.listCollections();
  for (const x of subCollections) {
    if (options.verbose) console.log(`deleting sub collection : ${x.path}`);
    const documents = await db.collection(x.path).listDocuments();
    documents.forEach(ref => batch.delete(ref))
  }
  return batch;
}
