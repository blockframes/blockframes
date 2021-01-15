import { region, config } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { firebaseRegion } from '@env';
export const functions = region(firebaseRegion);

import { backupBucket, storageBucket } from '../environments/environment';
import { PublicUser } from '../data/types';
import { isInMaintenance } from '@blockframes/firebase-utils';
import { IMaintenanceDoc, META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME, _isInMaintenance } from '@blockframes/utils/maintenance';

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
 * Gets the user document corresponding to a given `uid`.
 * Throws if the user does not exists.
 */
export async function getUser(userId: string): Promise<PublicUser> {
  const user = await db.doc(`users/${userId}`).get();
  return user.data()! as PublicUser;
}

export const skipInMaintenance = <T extends (...args: any[]) => any>(f: T): T | ((...args: Parameters<T>) => Promise<void>) => {
  // return a new function that is the old function + a check that early exits when we are restoring.
  return async (...args: Parameters<T>) => {
    if (maintenanceActive === null) return (await isInMaintenance(db)) ? Promise.resolve() : f(...args);
    else return maintenanceActive ? Promise.resolve() : f(...args);
  }
};

let maintenanceActive: boolean = null;

// * This caches the result of maintenance status in between function invocations and attaches a listener
// * to the document, meaning that a round trip to Firestore does not need to happen on every single function invocation.
// * This should boost performance by at least half a second and reduce costs by reducing queries.
db.collection(META_COLLECTION_NAME)
  .doc(MAINTENANCE_DOCUMENT_NAME)
  .onSnapshot(
    (snap) => {
      const maintenanceDoc = snap.data() as IMaintenanceDoc;
      maintenanceActive = _isInMaintenance(maintenanceDoc, 0);
    },
    // If there is an error, revert back to old method to prevent stuck functions
    () => (maintenanceActive = null)
  );
