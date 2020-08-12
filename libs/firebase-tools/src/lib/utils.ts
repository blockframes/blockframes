import * as admin from 'firebase-admin';
const db = admin.firestore();

export function getDocument<T>(path: string): Promise<T> {
  return db
    .doc(path)
    .get()
    .then(doc => doc.data() as T);
}