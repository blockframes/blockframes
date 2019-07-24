import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { backupBucket } from '../environments/environment';

admin.initializeApp(functions.config().firebase);
export const db = admin.firestore();
export const auth = admin.auth();

export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

export const getBackupBucketName = (): string => backupBucket; // TODO: secure bucket

export { admin, functions };

export async function getUserMail(userId: string): Promise<string | undefined> {
  const user = await admin.auth().getUser(userId);
  return user.email;
}
