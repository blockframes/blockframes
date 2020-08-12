import * as admin from 'firebase-admin';

export function getDocument<T>(db: admin.firestore.Firestore, path: string): Promise<T> {
  return db
    .doc(path)
    .get()
    .then(doc => doc.data() as T);
}