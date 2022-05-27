import { Change, region } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { firebaseRegion } from '@env';
export const functions = (config = defaultConfig) => region(firebaseRegion).runWith(config);
import { backupBucket, storageBucket } from '../environments/environment';
import { isInMaintenance } from '@blockframes/firebase-utils/maintenance';
import { defaultConfig } from '@blockframes/firebase-utils/firebase-utils';
import { META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME, _isInMaintenance } from '@blockframes/utils/maintenance';
import { IMaintenanceDoc } from '@blockframes/model';

if (!admin.apps.length) {
  admin.initializeApp();
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

export interface BlockframesSnapshot<T = FirebaseFirestore.DocumentData> {
  id: string,
  exists: boolean,
  ref: FirebaseFirestore.DocumentReference<T>,
  data(): T | undefined,
}

export interface BlockframesChange<T = FirebaseFirestore.DocumentData> {
  before: BlockframesSnapshot<T>,
  after: BlockframesSnapshot<T>,
}

function toDate<D>(target: D): D {
  if (typeof target !== 'object') return target;
  for (const key in target) {
    const value = target[key];
    if (!value || typeof value !== 'object') continue;
    if (value instanceof admin.firestore.Timestamp) {
      target[key] = value.toDate() as any;
      continue;
    }
    toDate(value)
  }
  return target;
}

export const convertToDate = <T extends (...args: any[]) => any>(f: T): T | ((...args: Parameters<T>) => Promise<void>) => {
  return async (...args: Parameters<T>) => {
    const firstArg = args.shift();
    if (firstArg instanceof Change) {
      const before: FirebaseFirestore.DocumentSnapshot = firstArg.before;
      const after: FirebaseFirestore.DocumentSnapshot = firstArg.after;
      const changes: BlockframesChange = {
        before: {
          id: before.id,
          exists: before.exists,
          ref: before.ref,
          data: () => before.data() ? toDate(before.data()) : undefined
        },
        after: {
          id: after.id,
          exists: after.exists,
          ref: after.ref,
          data: () => after.data() ? toDate(after.data()) : undefined
        }
      }
      return f(changes, ...args);
    } else if (firstArg instanceof FirebaseFirestore.QueryDocumentSnapshot) {
      const snapshot: BlockframesSnapshot = {
        id: firstArg.id,
        exists: firstArg.exists,
        ref: firstArg.ref,
        data: () => firstArg.data() ? toDate(firstArg.data()) : undefined
      }
      return f(snapshot, ...args);
    }

    return f(firstArg, ...args);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
