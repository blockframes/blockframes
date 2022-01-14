import { functions, skipInMaintenance } from './internals/firebase';
import { logErrors } from './internals/sentry';
export { ErrorResultResponse } from '@blockframes/utils/utils';
export { removeAllSubcollections } from '@blockframes/firebase-utils';
import { db } from './internals/firebase';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { staticModel } from '@blockframes/utils/static-model';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { centralOrgId } from './environments/environment';
import { Timestamp } from './data/internals';

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
  return functions().firestore
    .document(docPath)
    .onWrite(skipInMaintenance(logErrors(fn)));
}

export function onDocumentUpdate(docPath: string, fn: FunctionType) {
  return functions().firestore
    .document(docPath)
    .onUpdate(skipInMaintenance(logErrors(fn)));
}

export function onDocumentDelete(docPath: string, fn: FunctionType) {
  return functions().firestore
    .document(docPath)
    .onDelete(skipInMaintenance(fn))
}

export function onDocumentCreate(docPath: string, fn: FunctionType) {
  return functions().firestore
    .document(docPath)
    .onCreate(skipInMaintenance(logErrors(fn)));
}


export function createId() {
  return db.collection('_').doc().id;
}


export function hydrateLanguageForEmail(data: Record<string, MovieLanguageSpecification>) {
  return Object.keys(data)
    .map(lang => {
      const prefix: string[] = [];
      if (data[lang].dubbed) prefix.push(staticModel['movieLanguageTypes'].dubbed);
      if (data[lang].subtitle) prefix.push(staticModel['movieLanguageTypes'].subtitle);
      if (data[lang].caption) prefix.push(staticModel['movieLanguageTypes'].caption);
      if (prefix.length) return `${lang} ( ${prefix.join(', ')} )`;
      return lang;
    })
    .join(', ');
}


export function getReviewer(negotiation: Negotiation<Timestamp | Date>) {
  return negotiation.stakeholders.find(id => id !== negotiation.createdByOrg && id !== centralOrgId.catalog);
}
