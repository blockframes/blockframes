import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { chunk } from "lodash";
import * as env from '@env'
import type { File as GFile } from '@google-cloud/storage';
import { deconstructFilePath } from "@blockframes/utils/file-sanitizer";
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

/**
 * @param fullPath the storage path of the file
 */
export async function getDocAndPath(fullPath: string | undefined) {
  const db = admin.firestore();

  const { collection, docPath, isTmp, privacy, field, filePath } = deconstructFilePath(fullPath)

  const doc = db.doc(docPath);
  const snapshot = await doc.get();

  if (!snapshot.exists) {
    throw new Error('File Path point to a firestore document that does not exists');
  }
  const docData = snapshot.data();

  return {
    isTmp,
    privacy,
    filePath,
    doc,
    docData,
    field,
    docPath,
    collection
  }
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
  path.reduce((config: any, field) => (config ? config[field] : undefined), functions.config());

/**
 * Sorts an array of files in a bucket by timeCreated and returns the latest
 * @param files GCP file type
 */
export function getLatestFile(files: GFile[]) {
  return files
    .sort(
      (a, b) =>
        Number(new Date(a.metadata?.timeCreated)) - Number(new Date(b.metadata?.timeCreated))
    )
    .pop();
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


export async function storageFileExist(path: string) {
  const storage = admin.storage();
  const file = await storage.bucket().file(path);

  // for more info check
  //  - https://googleapis.dev/nodejs/storage/latest/File.html#exists
  //  - https://googleapis.dev/nodejs/storage/latest/global.html#FileExistsResponse
  const result = await file.exists();
  return result[0];
}
