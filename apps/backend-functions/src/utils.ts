import { db, skipInMaintenance } from './internals/firebase';
import { functions } from './internals/functions/defaultConfig';
import { logErrors } from './internals/sentry';
export { ErrorResultResponse } from '@blockframes/utils/utils';

///////////////////////////////////
// DOCUMENT ON-CHANGES FUNCTIONS //
///////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionType = (...args: any[]) => any;

/**
 * Trigger a function when a document is written (create / update / delete).
 *
 * Handles internal features such as skipping functions when we backup / restore the db.
 */
export function onDocumentWrite(docPath: string, fn: FunctionType) {
  return functions.firestore
    .document(docPath)
    .onWrite(skipInMaintenance(logErrors(fn)));
}

export function onDocumentUpdate(docPath: string, fn: FunctionType) {
  return functions.firestore
    .document(docPath)
    .onUpdate(skipInMaintenance(logErrors(fn)));
}

export function onDocumentDelete(docPath: string, fn: FunctionType) {
  return functions.firestore
    .document(docPath)
    .onDelete(skipInMaintenance(fn))
}

export function onDocumentCreate(docPath: string, fn: FunctionType) {
  return functions.firestore
    .document(docPath)
    .onCreate(skipInMaintenance(logErrors(fn)));
}

////////////////////
// MISC FUNCTIONS //
////////////////////

/**
 * Removes all one-depth subcollections
 * @param snapshot
 * @param batch
 */
export async function removeAllSubcollections(
  snapshot: FirebaseFirestore.DocumentSnapshot,
  batch: FirebaseFirestore.WriteBatch): Promise<FirebaseFirestore.WriteBatch> {
  console.log(`starting deletion of ${snapshot.ref.path} sub-collections`);
  const subCollections = await snapshot.ref.listCollections();
  for (const x of subCollections) {
    console.log(`deleting sub collection : ${x.path}`);
    const documents = await db.collection(x.path).listDocuments();
    documents.forEach(ref => batch.delete(ref))
  }
  return batch;
}
