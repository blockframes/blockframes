/**
 * Collection & Document manipulation
 *
 * This code deals directly with the low level parts of firebase,
 */
import { db } from '../firebase';
import { Organization, Stakeholder } from './types';

export function getCollection<T>(path: string): Promise<T[]> {
  return db
    .collection(path)
    .get()
    .then(collection => collection.docs.map(doc => doc.data() as T));
}

export function getDocument<T>(path: string): Promise<T> {
  return db
    .doc(path)
    .get()
    .then(doc => doc.data() as T);
}

/**
 * Try to get all the organization in the stakeholders subcollection of `/{collection}/{documentId}`.
 *
 * Use with care: this function assumes the stakeholders collection exists and
 * it doesn't not deduplicate the orgs.
 *
 * @param documentId
 * @param collection
 * @returns the organization that are in the document's stakeholders.
 */
export async function getOrgsOfDocument(
  documentId: string,
  collection: string
): Promise<Organization[]> {
  const stakeholders = await getCollection<Stakeholder>(`${collection}/${documentId}/stakeholders`);
  const promises = stakeholders.map(({ id }) => getDocument<Organization>(`orgs/${id}`));
  return Promise.all(promises);
}

export function getCount(collection: string) {
  // TODO: implement counters to make this function scalable.
  // relevant docs: https://firebase.google.com/docs/firestore/solutions/counters
  return db
    .collection(collection)
    .get()
    .then(col => col.size);
}
