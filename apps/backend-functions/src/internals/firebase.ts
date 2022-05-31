import { Change, region, RuntimeOptions } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { firebaseRegion, production } from '@env';
export const functions = (config = defaultConfig) => region(firebaseRegion).runWith(config);
import { isInMaintenance } from '@blockframes/firebase-utils/maintenance';
import { META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME, _isInMaintenance } from '@blockframes/utils/maintenance';
import { IMaintenanceDoc } from '@blockframes/model';
import { logErrors } from './sentry';
import { toDate } from '@blockframes/firebase-utils/firebase-utils';

if (!admin.apps.length) {
  admin.initializeApp();
}
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

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
      const maintenanceDoc = toDate(snap.data()) as IMaintenanceDoc;
      maintenanceActive = _isInMaintenance(maintenanceDoc, 0);
    },
    // If there is an error, revert back to old method to prevent stuck functions
    () => (maintenanceActive = null)
  );


///////////////////////////////////
// DOCUMENT ON-CHANGES FUNCTIONS //
///////////////////////////////////

export interface BlockframesSnapshot<T = admin.firestore.DocumentData> {
  id: string,
  exists: boolean,
  ref: admin.firestore.DocumentReference<T>,
  data(): T | undefined,
}

export interface BlockframesChange<T = admin.firestore.DocumentData> {
  before: BlockframesSnapshot<T>,
  after: BlockframesSnapshot<T>,
}

function createBlockframesSnapshot(snap: admin.firestore.DocumentSnapshot): BlockframesSnapshot {
  return {
    id: snap.id,
    exists: snap.exists,
    ref: snap.ref,
    data: () => snap.data() ? toDate(snap.data()) : undefined
  }
}

export const convertToDate = <T extends (...args: any[]) => any>(f: T): T | ((...args: Parameters<T>) => Promise<void>) => {
  return async (...args: Parameters<T>) => {
    const firstArg = args.shift();
    if (firstArg instanceof Change) {
      const changes: BlockframesChange = {
        before: createBlockframesSnapshot(firstArg.before),
        after: createBlockframesSnapshot(firstArg.after)
      }
      return f(changes, ...args);
    } else if (firstArg instanceof admin.firestore.QueryDocumentSnapshot) {
      const snapshot = createBlockframesSnapshot(firstArg);
      return f(snapshot, ...args);
    }

    return f(firstArg, ...args);
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
    .onWrite(skipInMaintenance(logErrors(convertToDate(fn))));
}

export function onDocumentUpdate(docPath: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
  return functions(config).firestore
    .document(docPath)
    .onUpdate(skipInMaintenance(logErrors(convertToDate(fn))));
}

export function onDocumentDelete(docPath: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
  return functions(config).firestore
    .document(docPath)
    .onDelete(skipInMaintenance(logErrors(convertToDate(fn))))
}

export function onDocumentCreate(docPath: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
  return functions(config).firestore
    .document(docPath)
    .onCreate(skipInMaintenance(logErrors(convertToDate(fn))));
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
