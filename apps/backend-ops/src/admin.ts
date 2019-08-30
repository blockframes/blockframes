import * as admin from 'firebase-admin';
import { firebase } from '@env';

export type Auth = admin.auth.Auth;
export type Firestore = admin.firestore.Firestore;
export type UserRecord = admin.auth.UserRecord;

export interface AdminServices {
  auth: Auth;
  db: Firestore;
  firebaseConfig: { projectId: string };
}

export function loadAdminServices(): AdminServices {
  admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount),
    credential: admin.credential.applicationDefault(),
    databaseURL: firebase.databaseURL
  });
  return { auth: admin.auth(), db: admin.firestore(), firebaseConfig: firebase };
}
