import * as admin from 'firebase-admin';
import {
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

/**
 * Disabled maintenance mode
 * @param db db to operate on
 * @param ago if set, will offset endedAt time into the past - seconds
 */
export function endMaintenance(db?: FirebaseFirestore.Firestore, ago?: number) {
  if (process.env.BLOCKFRAMES_MAINTENANCE_DISABLED) return;

  let endedAt = admin.firestore.FieldValue.serverTimestamp();
  if (ago) {
    const time = new Date(new Date().getTime() - ago)
    endedAt = admin.firestore.Timestamp.fromDate(time);
  }
  return maintenanceRef(db).set(
    {
      endedAt,
      startedAt: null,
    },
    { merge: false }
  );
}

export async function isInMaintenance(db?: FirebaseFirestore.Firestore): Promise<boolean> {
  try {
    const ref = maintenanceRef(db);
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

