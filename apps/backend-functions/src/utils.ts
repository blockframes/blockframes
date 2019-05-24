import { db } from "./firebase";

export interface Organization {
  id: string;
  userIds: string[];
}

interface Stakeholder {
  id: string;
  orgId: string;
}

export async function getCollection<T>(path: string): Promise<T[]> {
  return db
    .collection(path)
    .get()
    .then(collection => collection.docs.map(doc => doc.data() as T));
}

export async function getDocument(path: string) {
  return db
    .doc(path)
    .get()
    .then(doc => doc.data());
}

export async function getOrgsOfDelivery(deliveryId: string): Promise<Organization[]> {
  const stakeholders = await getCollection<Stakeholder>(`deliveries/${deliveryId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => db.doc(`orgs/${orgId}`).get());
  const orgs = await Promise.all(promises);
  return orgs.map(doc => doc.data() as Organization);
}

export async function getOrgsOfMovie(movieId: string): Promise<Organization[]> {
  const stakeholders = await getCollection<Stakeholder>(`movies/${movieId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => db.doc(`orgs/${orgId}`).get());
  const orgs = await Promise.all(promises);
  return orgs.map(doc => doc.data() as Organization);
}

export function getCount(collection: string) {
  return db.collection(collection).get().then(col => col.size)
}
