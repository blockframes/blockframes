import { request, RequestOptions } from 'https';
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

////////////////////
// MISC FUNCTIONS //
////////////////////

export function sendRequest<T = unknown>(options: RequestOptions, data?: unknown): Promise<T> {
  const postData = JSON.stringify(data) ?? '';
  const postOptions: RequestOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    }
  };
	return new Promise((resolve, reject) => {
		const req = request(options.method === 'POST' ? postOptions : options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body) as T));
      res.on('error', e => reject(e))
		});
    req.on('error', e => reject(e));
    if (options.method === 'POST') req.write(postData);

    req.end();
	});
}
