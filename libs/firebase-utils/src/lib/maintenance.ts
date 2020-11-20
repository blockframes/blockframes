import * as admin from 'firebase-admin';
import {
  EIGHT_MINUTES_IN_MS,
  IMaintenanceDoc,
  MAINTENANCE_DOCUMENT_NAME,
  META_COLLECTION_NAME,
  _isInMaintenance
} from '@blockframes/utils/maintenance';
import { loadAdminServices } from './util';


const maintenanceRef = (db?: FirebaseFirestore.Firestore) => {
  if (!db) db = loadAdminServices().db;
  return db.collection(META_COLLECTION_NAME).doc(MAINTENANCE_DOCUMENT_NAME);
};

export function startMaintenance(db?: FirebaseFirestore.Firestore) {
  if (process.env.BLOCKFRAMES_MAINTENANCE_DISABLED) {
    console.warn('Warning: startMaintenance() called but BLOCKFRAMES_MAINTENANCE_DISABLED is set to true. Maintenance mode is disabled...');
    return;
  }
  return maintenanceRef(db).set(
    { startedAt: admin.firestore.FieldValue.serverTimestamp(), endedAt: null },
    { merge: true }
  );
}

export function endMaintenance(db?: FirebaseFirestore.Firestore) {
  if (process.env.BLOCKFRAMES_MAINTENANCE_DISABLED) return;
  return maintenanceRef(db).set(
    {
      endedAt: admin.firestore.FieldValue.serverTimestamp(),
      startedAt: null,
    },
    { merge: true }
  );
}

/**
 *
 * @param delay 8 min by default. This delay is a security to
 * be sure that every process is stopped before continuing
 */
export async function isInMaintenance(delay = EIGHT_MINUTES_IN_MS, db?: FirebaseFirestore.Firestore): Promise<boolean> {
  try {
    const ref = maintenanceRef(db);
    const doc = await ref.get();

    // if document doesn't exist, it means that there is something not normal,
    // we force maintenance mode to true.
    if (!doc.exists) {
      return true;
    }

    return _isInMaintenance(doc.data() as IMaintenanceDoc, delay);
  } catch (e) {
    throw new Error(`Error while checking if app is in maintenance mode: ${e.message}`);
  }

}

export const skipInMaintenance = <T extends (...args: any[]) => any>(f: T): T | ((...args: Parameters<T>) => Promise<void>) => {
  // return a new function that is the old function + a check that early exits when we are restoring.
  return async (...args: Parameters<T>) => (await isInMaintenance()) ? Promise.resolve() : f(...args);
};
