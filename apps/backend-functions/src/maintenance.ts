import { db } from './internals/firebase';
import * as admin from 'firebase-admin';
import { EventContext } from 'firebase-functions';

type Timestamp = admin.firestore.Timestamp;

const EIGHT_MINUTES_IN_MS = 8 * 60 * 1000;

interface IMaintenanceDoc {
  startedAt: Timestamp | null;
  endedAt: Timestamp | null;
}

export const META_COLLECTION_NAME = '_META';

const maintenanceRef = () => {
  return db.collection(META_COLLECTION_NAME).doc('_MAINTENANCE');
};

export async function startMaintenance() {
  return maintenanceRef().set({
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    endedAt: null
  });
}

export async function endMaintenance() {
  return maintenanceRef().set({
    endedAt: admin.firestore.FieldValue.serverTimestamp(),
    startedAt: null
  });
}

async function getMaintenanceDoc(): Promise<IMaintenanceDoc | null> {
  const ref = maintenanceRef();
  const doc = await ref.get();

  // we've never seen any maintenance
  if (!doc.exists) {
    return null;
  }

  return doc.data() as IMaintenanceDoc;
}

export async function isInMaintenance() {
  const doc = await getMaintenanceDoc();

  if (!doc) {
    return false;
  }

  const { startedAt, endedAt } = doc;

  const now = admin.firestore.Timestamp.now();

  if (endedAt) {
    // Wait some time before allowing any operation on the db.
    // this prevents triggering firebase events.
    // NOTE: this is hack-ish but good enough for our needs! we'll revisit this later.
    return endedAt.toMillis() + EIGHT_MINUTES_IN_MS > now.toMillis();
  }

  if (startedAt) {
    return true;
  }

  throw new Error(
    'Unexpected cases for maintenance check! please check the _META/_MAINTENANCE document.'
  );
}

/**
 * Return wether the given event context occurred during the last maintenance time.
 * @param context
 */
export async function wasInMaintenance(context: EventContext) {
  const doc = await getMaintenanceDoc();
  if (!doc) {
    return false;
  }

  const eventTime: Timestamp = admin.firestore.Timestamp.fromDate(new Date(context.timestamp));
  const { startedAt, endedAt } = doc;

  if (!startedAt) {
    return false;
  }

  if (!endedAt) {
    // still in maintenance.
    // TODO: we could let this code run, it comes from a previous event, but that sounds dangerous.
    // the best would be to disable the whole application for a few minutes BEFORE
    // starting the migration code. So this case never happens.
    return true;
  }

  // The event occured within the last migration timeframe.
  return startedAt < eventTime && eventTime < endedAt;
}

export function skipInMaintenance<T, R>(
  f: (data: T, context: EventContext) => R | undefined
): (data: T, context: EventContext) => Promise<R | undefined> {
  // return a new function that is:
  // the old function + a check that early exits when we are restoring.
  return async (x: T, context: EventContext) => {
    // early exit
    if (await wasInMaintenance(context)) {
      return;
    }

    return f(x, context);
  };
}
