import * as admin from 'firebase-admin';
import { firebase } from '@env';
import { firebase as firebaseCI } from 'env/env.ci';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import requiredVars from 'tools/mandatory-env-vars.json';
import { chunk } from 'lodash';

export function batchIteratorFactory<K = any>(batch: K[], cb: (p: K) => Promise<any>, chunkSize = 10) {
  function* batchGenerator() {
    const chunks = chunk(batch, chunkSize);
    while (chunks && chunks.length > 0) {
      console.log(`Operations remaining: ${chunks.length * chunkSize}/${batch.length}`);
      yield Promise.all(chunks.pop().map(cb))
    }
    console.log(`Batch of ${batch.length} finished with chunkSize ${chunkSize}`)
  }
  return batchGenerator();
}

/**
 * This function is an iterator that allows you to fetch documents from a collection in chunks
 * This is a generator, which means you should use `for await ()` syntax.
 * Make sure you output the iterator before iterating from the generator
 * @param ref the collection reference object
 * @param orderBy the unique key of the document object to order by
 * @param batchSize how many docs to fetch per iteration
 */
export async function* getCollectionInBatches<K>(ref: admin.firestore.CollectionReference, orderBy: string, batchSize = 1000 ) {
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

export interface JsonlDbRecord {
  docPath: string;
  content: { [key: string]: any };
}

export function readJsonlFile(dbBackupPath: string) {
  const file = readFileSync(dbBackupPath, 'utf-8');
  return file
    .split('\n')
    .filter((str) => !!str) // remove last line
    .map((str) => JSON.parse(str) as JsonlDbRecord);
}

export function warnMissingVars(): void | never {
  const warn = (key: string, msg: string) => {
    console.warn(`Please ensure the following variable is set in .env : ${key}`);
    console.warn(`More info: ${msg}\n`);
  };
  // Use '||' instead of '??' to detect empty string
  requiredVars.map(
    ({ key, msg }: { key: string; msg: string }) => process.env?.[key] || warn(key, msg)
  );
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
  firebaseConfig: { projectId: string };
  getCI: () => admin.app.App;
}

let ci: admin.app.App;

export function loadAdminServices(): AdminServices {
  config();
  warnMissingVars();

  let cert: string | admin.ServiceAccount;
  try {
    // If service account is a stringified json object
    cert = JSON.parse(process.env.FIREBASE_CI_SERVICE_ACCOUNT as string);
  } catch (err) {
    // If service account is a path
    cert = process.env.FIREBASE_CI_SERVICE_ACCOUNT as admin.ServiceAccount;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      ...firebase,
      credential: admin.credential.applicationDefault(),
    });
  }

  const getCI = () => {
    if (!ci) {
      ci = admin.initializeApp(
        {
          projectId: firebaseCI.projectId,
          credential: admin.credential.cert(cert),
        },
        'CI-app'
      );
    }
    return ci;
  };

  return {
    getCI,
    auth: admin.auth(),
    db: admin.firestore(),
    firebaseConfig: firebase,
    storage: admin.storage(),
  };
}
