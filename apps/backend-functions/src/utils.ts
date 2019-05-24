import { db } from "./firebase";

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

export async function getOrgsOfDelivery(deliveryId: string): Promise<Organization[]> {
  const stakeholders = await getCollection<Stakeholder>(`deliveries/${deliveryId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => getDocument<Organization>(`orgs/${orgId}`));
  return Promise.all(promises);
}

export async function getOrgsOfMovie(movieId: string): Promise<Organization[]> {
  const stakeholders = await getCollection<Stakeholder>(`movies/${movieId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => getDocument<Organization>(`orgs/${orgId}`));
  return Promise.all(promises);
}

export function getCount(collection: string) {
  return db.collection(collection).get().then(col => col.size)
}
