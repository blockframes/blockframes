import * as admin from 'firebase-admin';
import {
  IMaintenanceDoc,
  MAINTENANCE_DOCUMENT_NAME,
  META_COLLECTION_NAME,
  _isInMaintenance
} from '@blockframes/utils/maintenance';
import { loadAdminServices } from './util';

interface MaintenanceOptions {
  checkMissingVars?: boolean,
  db?: FirebaseFirestore.Firestore
}

const maintenanceRef = ({ db, checkMissingVars = true }: MaintenanceOptions) => {
  if (!db) db = loadAdminServices(checkMissingVars).db;
  return db.collection(META_COLLECTION_NAME).doc(MAINTENANCE_DOCUMENT_NAME);
};

export function startMaintenance(db?: FirebaseFirestore.Firestore) {
  if (process.env.BLOCKFRAMES_MAINTENANCE_DISABLED) {
    console.warn('Warning: startMaintenance() called but BLOCKFRAMES_MAINTENANCE_DISABLED is set to true. Maintenance mode is disabled...');
    return;
  }
  return maintenanceRef({ db }).set(
    { startedAt: admin.firestore.FieldValue.serverTimestamp(), endedAt: null },
    { merge: true }
  );
}

export function endMaintenance(db?: FirebaseFirestore.Firestore) {
  if (process.env.BLOCKFRAMES_MAINTENANCE_DISABLED) return;
  return maintenanceRef({ db }).set(
    {
      endedAt: admin.firestore.FieldValue.serverTimestamp(),
      startedAt: null,
    },
    { merge: true }
  );
}

/**
 * 
 * @param db 
 */
async function isInMaintenance(): Promise<boolean> {
  try {
    const ref = maintenanceRef({ checkMissingVars: false });
    const doc = await ref.get();

    // if document doesn't exist, it means that there is something not normal,
    // we force maintenance mode to true.
    if (!doc.exists) {
      return true;
    }

    return _isInMaintenance(doc.data() as IMaintenanceDoc, 0);
  } catch (e) {
    throw new Error(`Error while checking if app is in maintenance mode: ${e.message}`);
  }

}

export const skipInMaintenance = <T extends (...args: any[]) => any>(f: T): T | ((...args: Parameters<T>) => Promise<void>) => {
  // return a new function that is the old function + a check that early exits when we are restoring.
  return async (...args: Parameters<T>) => (await isInMaintenance()) ? Promise.resolve() : f(...args);
};
