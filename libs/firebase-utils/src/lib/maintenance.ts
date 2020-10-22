import * as admin from 'firebase-admin';
import {
  EIGHT_MINUTES_IN_MS,
  IMaintenanceDoc,
  MAINTENANCE_DOCUMENT_NAME,
  META_COLLECTION_NAME,
  _isInMaintenance
} from '@blockframes/utils/maintenance';


const maintenanceRef = () => {
  const db = admin.firestore();
  return db.collection(META_COLLECTION_NAME).doc(MAINTENANCE_DOCUMENT_NAME);
};

export async function startMaintenance() {
  if (process.env.BLOCKFRAMES_MAINTENANCE_DISABLED) {
    console.warn('Warning: startMaintenance() called but BLOCKFRAMES_MAINTENANCE_DISABLED is set to true. Maintenance mode is disabled...');
    return;
  }
  return maintenanceRef().set({ startedAt: admin.firestore.FieldValue.serverTimestamp(), endedAt: null });
}

export async function endMaintenance() {
  if (process.env.BLOCKFRAMES_MAINTENANCE_DISABLED) return;
  return maintenanceRef().set({
    endedAt: admin.firestore.FieldValue.serverTimestamp(),
    startedAt: null
  });
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
