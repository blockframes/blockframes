import { db } from './internals/firebase';
import * as admin from 'firebase-admin';

type Timestamp = admin.firestore.Timestamp;

const THIRTY_SECONDS_IN_MS = 30 * 1000;

interface IMaintenanceDoc {
  startedAt: Timestamp | null;
  endedAt: Timestamp | null;
}

const maintenanceRef = () => {
  return db.collection('_META').doc('_MAINTENANCE');
};

export async function startMaintenance() {
  return maintenanceRef().set({ startedAt: admin.firestore.FieldValue.serverTimestamp(), endedAt: null });
}

export async function endMaintenance() {
  return maintenanceRef().set({
    endedAt: admin.firestore.FieldValue.serverTimestamp(),
    startedAt: null
  });
}

export async function isInMaintenance() {
  const ref = maintenanceRef();
  const doc = await ref.get();

  // we've never seen any maintenance
  if (!doc.exists) {
    return false;
  }

  const { startedAt, endedAt } = doc.data() as IMaintenanceDoc;
  const now = admin.firestore.Timestamp.now();

  if (endedAt) {
    // Wait 30s before allowing any operation on the db.
    // this prevents triggering firebase events.
    // NOTE: this is hack-ish but good enough for our needs! we'll revisit this later.
    return endedAt.toMillis() + THIRTY_SECONDS_IN_MS > now.toMillis();
  }

  if (startedAt) {
    return true;
  }

  throw new Error(
    'Unexpected cases for maintenance check! please check the _META/_MAINTENANCE document.'
  );
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
