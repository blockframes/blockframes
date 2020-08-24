import * as admin from 'firebase-admin';
import { chunk } from "lodash";

export function getDocument<T>(path: string): Promise<T> {
  const db = admin.firestore();
  return db
    .doc(path)
    .get()
    .then(doc => doc.data() as T);
}

export function getCollectionRef<T>(path: string): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
  const db = admin.firestore();
  return db
    .collection(path)
    .get();
}

export function getCollection<T>(path: string): Promise<T[]> {
  return getCollectionRef(path).then(collection => collection.docs.map(doc => doc.data() as T));
}

export async function runChunks(rows: any[], cb: any, rowsConcurrency = 10, verbose = true) {
  const chunks = chunk(rows, rowsConcurrency);
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (verbose) { console.log(`Processing chunk ${i + 1}/${chunks.length}`); }
    const promises = c.map(cb);
    await Promise.all(promises);
  }
}