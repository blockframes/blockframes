import { db, functions } from "./firebase";
import * as backup from './backup';

///////////////
// VARIABLES //
///////////////

// String refers to svg icon name
export const APP_DELIVERY_ICON = 'media_delivering';
export const APP_MOVIE_ICON = 'media_financiers';

////////////////
// INTERFACES //
////////////////

// TODO: Figure out how we can access our front models

export interface Organization {
  id: string;
  userIds: string[];
  name: string;
}

export interface Stakeholder {
  id: string;
  orgId: string;
}

export interface Delivery {
  id: string;
  movieId: string;
  processedId: string;
}

export interface Movie {
  id: string;
  title: {
    original: string
  };
}

export interface Material {
  id: string;
  value: string;
  description: string;
  category: string;
  deliveriesIds: string[];
  state: string;
}

export interface SnapObject {
  movie: Movie;
  docID: DocID;
  org: Organization;
  eventType: string;
  delivery?: Delivery | null;
  newStakeholderId?: string;
  count?: number;
}

export interface DocID {
  id: string,
  type : 'movie' | 'delivery' | 'material'
}

////////////////////////////////////
// COLLECTIONS & DOCUMENT GETTERS //
////////////////////////////////////

export async function getCollection<T>(path: string): Promise<T[]> {
  return db
    .collection(path)
    .get()
    .then(collection => collection.docs.map(doc => doc.data() as T));
}

export async function getDocument<T>(path: string): Promise<T> {
  return db
    .doc(path)
    .get()
    .then(doc => doc.data() as T);
}

export async function getOrgsOfDocument(documentId: string, collection: string): Promise<Organization[]> {
  const stakeholders = await getCollection<Stakeholder>(`${collection}/${documentId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => getDocument<Organization>(`orgs/${orgId}`));
  return Promise.all(promises);
}

export function getCount(collection: string) {
  return db.collection(collection).get().then(col => col.size)
}

///////////////////////////////////
// DOCUMENT ON-CHANGES FUNCTIONS //
///////////////////////////////////

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
export function isTheSame(matA: Material, matB: Material): boolean {
  const getProperties = ({value, description, category}: Material) => ({ value, description, category });
  return JSON.stringify(getProperties(matA)) === JSON.stringify(getProperties(matB));
}
