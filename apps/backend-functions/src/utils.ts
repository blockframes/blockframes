import { functions } from './internals/firebase';
import * as backup from './backup';
import { MaterialDocument } from './data/types';

///////////////////////////////////
// DOCUMENT ON-CHANGES FUNCTIONS //
///////////////////////////////////

/**
 * Trigger a function when a document is written (create / update / delete).
 *
 * Handles internal features such as skipping functions when we backup / restore the db.
 */
export function onDocumentWrite(docPath: string, fn: Function) {
  return functions.firestore
    .document(docPath)
    .onWrite(backup.skipWhenRestoring(fn))
}

export function onDocumentDelete(docPath: string, fn: Function) {
  return functions.firestore
  .document(docPath)
  .onDelete(backup.skipWhenRestoring(fn))
}

export function onDocumentUpdate(docPath: string, fn: Function) {
  return functions.firestore
  .document(docPath)
  .onUpdate(backup.skipWhenRestoring(fn));
}

export function onOrganizationDocumentUpdate(docPath: string, fn: Function) {
  return functions.runWith({timeoutSeconds: 540}).firestore // same as above but with the max timout possible for blockchain txs
  .document(docPath)
  .onUpdate(backup.skipWhenRestoring(fn));
}

export function onDocumentCreate(docPath: string, fn: Function) {
  return functions.firestore
  .document(docPath)
  .onCreate(backup.skipWhenRestoring(fn));
}

////////////////////
// MISC FUNCTIONS //
////////////////////

/**
 * Checks properties of two material to tell if they are the same or not.
 */
export function isTheSame(matA: MaterialDocument, matB: MaterialDocument): boolean {
  const getProperties = ({value, description, category}: MaterialDocument) => ({ value, description, category });
  return JSON.stringify(getProperties(matA)) === JSON.stringify(getProperties(matB));
}
