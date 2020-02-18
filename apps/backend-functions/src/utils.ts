import { db, functions } from './internals/firebase';
import { MaterialDocument } from './data/types';
import { logErrors } from './internals/sentry';
import { skipInMaintenance } from './maintenance';

///////////////////////////////////
// DOCUMENT ON-CHANGES FUNCTIONS //
///////////////////////////////////

/**
 * Trigger a function when a document is written (create / update / delete).
 *
 * Handles internal features such as skipping functions when we backup / restore the db.
 */
export function onDocumentWrite(docPath: string, fn: Function) {
  return functions.firestore.document(docPath).onWrite(skipInMaintenance(logErrors(fn)));
}

export function onDocumentDelete(docPath: string, fn: Function) {
  return functions.firestore
    .document(docPath)
    .onDelete(skipInMaintenance(fn))
}

export function onDocumentUpdate(docPath: string, fn: Function) {
  return functions.firestore
    .document(docPath)
    .onUpdate(skipInMaintenance(fn));
}

/** Same as onDocumentUpdate but with the max timeout possible (blockchain txs take time). */
export function onOrganizationDocumentUpdate(docPath: string, fn: Function) {
  return functions.runWith({timeoutSeconds: 540}).firestore // same as above but with the max timout possible for blockchain txs
  .document(docPath)
  .onUpdate(skipInMaintenance(logErrors(fn)));
}

export function onDocumentCreate(docPath: string, fn: Function) {
  return functions.firestore.document(docPath).onCreate(skipInMaintenance(logErrors(fn)));
}

////////////////////
// MISC FUNCTIONS //
////////////////////

/**
 * Checks properties of two material to tell if they are the same or not.
 */
export function isTheSame(matA: MaterialDocument, matB: MaterialDocument): boolean {
  const getProperties = ({ value, description, category }: MaterialDocument) => ({ value, description, category });
  return JSON.stringify(getProperties(matA)) === JSON.stringify(getProperties(matB));
}

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
