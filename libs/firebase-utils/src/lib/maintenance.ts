import {
  MAINTENANCE_DOCUMENT_NAME,
  META_COLLECTION_NAME,
  _isInMaintenance
} from '@blockframes/utils/maintenance';
import { loadAdminServices } from './util';
import { IMaintenanceDoc } from '@blockframes/model';
import { toDate } from './firebase-utils';

const maintenanceRef = (db?: FirebaseFirestore.Firestore) => {
  if (!db) db = loadAdminServices().db;
  return db.collection(META_COLLECTION_NAME).doc(MAINTENANCE_DOCUMENT_NAME);
};

export function startMaintenance(db?: FirebaseFirestore.Firestore) {
  return maintenanceRef(db).set(
    { startedAt: new Date(), endedAt: null },
    { merge: true }
  );
}

/**
 * Disabled maintenance mode
 * @param db db to operate on
 * @param ago if set, will offset endedAt time into the past - seconds
 */
export function endMaintenance(db?: FirebaseFirestore.Firestore, ago?: number) {
  let endedAt = new Date();
  if (ago) {
    const time = new Date(new Date().getTime() - ago);
    endedAt = time;
  }
  return maintenanceRef(db).set({ endedAt, startedAt: null }, { merge: false });
}

export async function isInMaintenance(db?: FirebaseFirestore.Firestore): Promise<boolean> {
  try {
    const ref = maintenanceRef(db);
    const doc = await ref.get();

    // if document doesn't exist, it means that there is something not normal,
    // we force maintenance mode to true.
    if (!doc.exists) return true;

    return _isInMaintenance(toDate<IMaintenanceDoc>(doc.data()), 0);
  } catch (e) {
    throw new Error(`Error while checking if app is in maintenance mode: ${e.message}`);
  }

}

