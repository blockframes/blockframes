import { region, config } from 'firebase-functions';
import * as admin from 'firebase-admin';

export const functions = region('europe-west1')

import { backupBucket, storageBucket } from '../environments/environment';
import { PublicUser } from '../data/types';

if (!admin.apps.length) {
  admin.initializeApp(config().firebase);
}
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

// @deprecated import vars from env directly instead of using this.
export const getBackupBucketName = (): string => backupBucket;
export const getStorageBucketName = (): string => storageBucket;

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
