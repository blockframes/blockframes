/**
 * Exposes imports and types to access the firebase / firestore / gcloud admin tools.
 *
 * Helper to avoid duplicating all the "semi-broken" google type defs.
 */
import * as admin from 'firebase-admin';
import { firebase } from '@env';

export type Auth = admin.auth.Auth;
export type Firestore = admin.firestore.Firestore;
export type DocumentReference = admin.firestore.DocumentReference;
export type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;
export type QuerySnapshot = admin.firestore.QuerySnapshot;
export type Transaction = admin.firestore.Transaction;
export type UserRecord = admin.auth.UserRecord;

export interface AdminServices {
  auth: Auth;
  db: Firestore;
  firebaseConfig: { projectId: string };
}

export function loadAdminServices(): AdminServices {
  if (!admin.apps.length) {
    admin.initializeApp({
      ...firebase,
      // credential: admin.credential.cert(serviceAccount),
      credential: admin.credential.applicationDefault(),
      databaseURL: firebase.databaseURL
    });
  }

  return { auth: admin.auth(), db: admin.firestore(), firebaseConfig: firebase };
}
