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

export async function getOrgsOfDocument(
  documentId: string,
  collection: string
): Promise<Organization[]> {
  const stakeholders = await getCollection<Stakeholder>(`${collection}/${documentId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => getDocument<Organization>(`orgs/${orgId}`));
  return Promise.all(promises);
}

export function getCount(collection: string) {
  return db
    .collection(collection)
    .get()
    .then(col => col.size);
}
