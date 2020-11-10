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

export async function setImportRunning(status: boolean, db?: FirebaseFirestore.Firestore) {
  return maintenanceRef(db).set({ importRunning: status } as Partial<IMaintenanceDoc>, { merge: true });
}

export async function triggerImportError(db?: FirebaseFirestore.Firestore) {
  return maintenanceRef(db).update({ 'importRunning': admin.firestore.FieldValue.delete() });
}

export async function isImportRunning(db: FirebaseFirestore.Firestore) {
  const maintenanceSnapshot = await maintenanceRef(db).get();
  const maintenanceDoc = maintenanceSnapshot.data() as IMaintenanceDoc;
  return maintenanceDoc.importRunning;
}

export async function importComplete(db?: FirebaseFirestore.Firestore) {
  if (!db) db = loadAdminServices().db;
  let unsubscribe: () => void;
  const p1 = new Promise((res, rej) => {
    unsubscribe = maintenanceRef(db).onSnapshot((snap) => {
      console.log('Listening for Firestore import completion...');
      const maintenanceDoc = snap.data() as IMaintenanceDoc;
      const isRunning = maintenanceDoc.importRunning ?? rej('importRunning not set on maintenance doc, an error may have occurred!');
      if (isRunning === false) res();
    });
  });
  const p2 = p1.then(unsubscribe);
  return p2;
}

export async function startMaintenance() {
  if (process.env.BLOCKFRAMES_MAINTENANCE_DISABLED) {
    console.warn('Warning: startMaintenance() called but BLOCKFRAMES_MAINTENANCE_DISABLED is set to true. Maintenance mode is disabled...');
    return;
  }
  return maintenanceRef().set(
    { startedAt: admin.firestore.FieldValue.serverTimestamp(), endedAt: null },
    { merge: true }
  );
}

export async function endMaintenance() {
  if (process.env.BLOCKFRAMES_MAINTENANCE_DISABLED) return;
  return maintenanceRef().set(
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
export async function isInMaintenance(delay = EIGHT_MINUTES_IN_MS): Promise<boolean> {
  try {
    const ref = maintenanceRef();
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

// TODO: take the time to fix the types,
// probably turn this into a generic (f: T) to and preserve types.
export const skipInMaintenance = (f: any) => {
  // return a new function that is:
  // the old function + a check that early exits when we are restoring.
  return async (...args: any[]) => {
    // early exit
    if (await isInMaintenance()) {
      return true;
    }

    return f(...args);
  };
};
