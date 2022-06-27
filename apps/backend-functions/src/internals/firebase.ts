import { Change, region, RuntimeOptions } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { firebaseRegion, production } from '@env';
export const functions = (config = defaultConfig) => region(firebaseRegion).runWith(config);
import { isInMaintenance } from '@blockframes/firebase-utils/maintenance';
import { META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME, _isInMaintenance } from '@blockframes/utils/maintenance';
import { IMaintenanceDoc } from '@blockframes/model';
import { logErrors } from './sentry';
import { toDate } from '@blockframes/firebase-utils/firebase-utils';
import { BlockframesChange, BlockframesSnapshot } from '@blockframes/firebase-utils/types';
import { getAuth, getDb, getStorage } from '@blockframes/firebase-utils';

export const db = getDb()
export const auth = getAuth()
export const storage = getStorage()

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
      const maintenanceDoc = toDate<IMaintenanceDoc>(snap.data());
      maintenanceActive = _isInMaintenance(maintenanceDoc, 0);
    },
    // If there is an error, revert back to old method to prevent stuck functions
    () => (maintenanceActive = null)
  );


///////////////////////////////////
// DOCUMENT ON-CHANGES FUNCTIONS //
///////////////////////////////////

function createBlockframesSnapshot(snap: admin.firestore.DocumentSnapshot): BlockframesSnapshot {
  return {
    id: snap.id,
    exists: snap.exists,
    ref: snap.ref,
    data: () => toDate(snap.data())
  }
}

const stateChangeToDate = <T extends (...args: any[]) => any>(f: T): T | ((...args: Parameters<T>) => Promise<void>) => {
  return async (...args: Parameters<T>) => {
    const firstArg: Change<any> = args.shift();
    const changes: BlockframesChange = {
      before: createBlockframesSnapshot(firstArg.before),
      after: createBlockframesSnapshot(firstArg.after)
    }
    return f(changes, ...args);
  }
};

const snapshotToDate = <T extends (...args: any[]) => any>(f: T): T | ((...args: Parameters<T>) => Promise<void>) => {
  return async (...args: Parameters<T>) => {
    const firstArg: admin.firestore.QueryDocumentSnapshot = args.shift();
    const snapshot = createBlockframesSnapshot(firstArg);
    return f(snapshot, ...args);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionType = (...args: any[]) => any;

/**
 * Trigger a function when a document is written (create / update / delete).
 *
 * Handles internal features such as skipping functions when we backup / restore the db.
 */
export function onDocumentWrite(docPath: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
  return functions(config).firestore
    .document(docPath)
    .onWrite(skipInMaintenance(logErrors(stateChangeToDate(fn))));
}

export function onDocumentUpdate(docPath: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
  return functions(config).firestore
    .document(docPath)
    .onUpdate(skipInMaintenance(logErrors(stateChangeToDate(fn))));
}

export function onDocumentDelete(docPath: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
  return functions(config).firestore
    .document(docPath)
    .onDelete(skipInMaintenance(logErrors(snapshotToDate(fn))))
}

export function onDocumentCreate(docPath: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
  return functions(config).firestore
    .document(docPath)
    .onCreate(skipInMaintenance(logErrors(snapshotToDate(fn))));
}

/**
 * Default runtime options for functions
 */
export const defaultConfig: RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '256MB',
};

/**
 * Runtime options to keep a function hot
 * Used to improve response time
 */
export const hotConfig: RuntimeOptions = {
  ...defaultConfig,
  maxInstances: production ? 1 : 0
}

/**
 * Runtime options for heavy functions
 */
export const heavyConfig: RuntimeOptions = {
  timeoutSeconds: 300,
  memory: '1GB',
};

/**
 * Runtime options for super heavy functions
 */
export const superHeavyConfig: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '4GB',
};
