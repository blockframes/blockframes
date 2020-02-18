import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export type DocumentReference = admin.firestore.DocumentReference;

import { backupBucket } from '../environments/environment';
import { PublicUser } from '../data/types';

admin.initializeApp(functions.config().firebase);
export const db = admin.firestore();
export const auth = admin.auth();

export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

export const getBackupBucketName = (): string => backupBucket; // TODO: secure bucket

export { admin, functions };

/**
 * Gets the user email for the user corresponding to a given `uid`.
 * Throws if the user does not exists.
 */
export async function getUserMail(userId: string): Promise<string | undefined> {
  const user = await admin.auth().getUser(userId);
  return user.email;
}

/**
 * Gets the user email for the user corresponding to a given `uid`.
 * Throws if the user does not exists.
 */
export async function getUser(userId: string): Promise<PublicUser> {
  const user = await db.doc(`users/${userId}`).get();
  return user.data()! as PublicUser;
}
