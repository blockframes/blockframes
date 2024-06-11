import { chunk } from 'lodash';
import * as env from '@env';
import { getDb } from './initialize';

export function toDate<D>(target: FirebaseFirestore.DocumentData): D {
  if (!target) return;
  if (typeof target !== 'object') return target;
  for (const key in target) {
    const value = target[key];
    if (!value || typeof value !== 'object') continue;
    if (!!value['_seconds'] && value['_nanoseconds'] >= 0) {
      try {
        target[key] = value.toDate();
      } catch (_) {
        console.log(`${key} is not a Firebase Timestamp`);
      }
      continue;
    }
    toDate(value);
  }
  return target as D;
}

export function getDocumentSnap(path: string, db = getDb(), tx?: FirebaseFirestore.Transaction): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>> {
  const ref = db.doc(path);
  return tx ? tx.get(ref) : db.doc(path).get();
}

export function getDocument<T>(path: string, db?: FirebaseFirestore.Firestore, tx?: FirebaseFirestore.Transaction): Promise<T> {
  return getDocumentSnap(path, db, tx).then(doc => toDate<T>(doc.data()));
}

export async function queryDocument<T>(query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, tx?: FirebaseFirestore.Transaction): Promise<T> {
  const snap = tx ? await tx.get(query.limit(1)) : await query.limit(1).get();
  return toDate<T>(snap.docs[0].data());
}

export async function queryDocuments<T>(query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, tx?: FirebaseFirestore.Transaction): Promise<T[]> {
  const snap = tx ? await tx.get(query) : await query.get();
  return snap.docs.map(doc => toDate<T>(doc.data()));
}

export function getCollectionRef(path: string): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
  const db = getDb();
  return db.collection(path).get();
}

export function getCollection<T>(path: string): Promise<T[]> {
  return getCollectionRef(path).then(collection => collection.docs.map(doc => toDate<T>(doc.data())));
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

