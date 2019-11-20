/**
 * Collection & Document manipulation
 *
 * This code deals directly with the low level parts of firebase,
 */
import { db } from '../internals/firebase';
import { OrganizationDocument } from './types';
import { StakeholderDocument } from '@blockframes/organization/stakeholder/types';
import { PermissionsDocument } from '@blockframes/permissions/types';

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
export async function getOrganizationsOfDocument(
  documentId: string,
  collection: string
): Promise<OrganizationDocument[]> {
  const stakeholders = await getCollection<StakeholderDocument>(
    `${collection}/${documentId}/stakeholders`
  );
  const promises = stakeholders.map(({ id }) => getDocument<OrganizationDocument>(`orgs/${id}`));
  return Promise.all(promises);
}

/** Get the number of elements in a firestore collection */
export function getCount(collection: string): Promise<number> {
  // TODO: implement counters to make this function scalable. => ISSUE#646
  // relevant docs: https://firebase.google.com/docs/firestore/solutions/counters
  return db
    .collection(collection)
    .get()
    .then(col => col.size);
}

/** Retrieve the list of superAdmins of an organization */
export async function getSuperAdminIds(organizationId: string): Promise<string[]> {
  const permissionsRef = db.collection('permissions').doc(organizationId);
  const permissionsDoc = await permissionsRef.get();

  if (!permissionsDoc.exists) {
    throw new Error(`organization: ${organizationId} does not exists`);
  }

  const { superAdmins } = permissionsDoc.data() as PermissionsDocument;
  return superAdmins;
}
