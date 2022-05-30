import * as admin from 'firebase-admin';
import { chunk } from 'lodash';
import * as env from '@env';

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

