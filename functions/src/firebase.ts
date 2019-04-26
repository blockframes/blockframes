import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);
export const db = admin.firestore();
export const auth = admin.auth();

export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

export const getBackupBucketName = (): string => functions.config().backup.bucket; // TODO: secure bucket

export { admin, functions };
