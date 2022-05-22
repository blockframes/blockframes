import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { chunk } from "lodash";
import * as env from '@env'
import { RuntimeOptions } from 'firebase-functions';

export function getDocumentRef(path: string): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>> {
  const db = admin.firestore();
  return db.doc(path).get();
}

export function getDocument<T>(path: string): Promise<T> {
  return getDocumentRef(path).then(doc => doc.data() as T);
}

export function getCollectionRef(path: string): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
  const db = admin.firestore();
  return db.collection(path).get();
}

export function getCollection<T>(path: string): Promise<T[]> {
  return getCollectionRef(path).then(collection => collection.docs.map(doc => doc.data() as T));
}

type AsyncReturnType<T extends (args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer U> ? U
  : T extends (...args: any) => infer U ? U
  : any

export async function runChunks<K, T extends (arg: K) => Promise<any>>(rows: K[], cb: T, rowsConcurrency?: number, verbose = true) {
  const chunks = chunk(rows, rowsConcurrency || env?.['chunkSize'] || 10);
  const output: AsyncReturnType<T>[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (verbose) { console.log(`Processing chunk ${i + 1}/${chunks.length}`); }
    const promises = c.map(cb);
    output.concat(await Promise.all(promises))
  }
  return output;
}

/**
 * Helper to work in local / remote dev mode:
 * in local the function config will be empty and this function will return an undefined value.
 * Later, when we test the backend functions code, we'll let dev define env variables
 * for local testing.
 *
 * @param path the field path to look for, ['x', 'y'] will look for config.x.y
 */
export const mockConfigIfNeeded = (...path: string[]): any =>
  path.reduce((config: any, field) => (config ? config[field] : undefined), functions.config()); // TODO! This is terrible why use reduce?


/**
 * Default runtime options for functions
 */
 export const defaultConfig: RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '256MB',
};

/**
 * Runtime options to keep a function hot
 * Used to improve response time
 */
export const hotConfig: RuntimeOptions = {
  ...defaultConfig,
  maxInstances: env.production ? 1 : 0
}

/**
 * Runtime options for heavy functions
 */
export const heavyConfig: RuntimeOptions = {
  timeoutSeconds: 300,
  memory: '1GB',
};

/**
 * Runtime options for super heavy functions
 */
 export const superHeavyConfig: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '4GB',
};

