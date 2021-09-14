import { functions, skipInMaintenance } from './internals/firebase';
import { logErrors } from './internals/sentry';
export { ErrorResultResponse } from '@blockframes/utils/utils';
export { removeAllSubcollections } from '@blockframes/firebase-utils';

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

