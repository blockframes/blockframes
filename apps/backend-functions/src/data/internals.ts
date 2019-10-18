/**
 * Collection & Document manipulation
 *
 * This code deals directly with the low level parts of firebase,
 */
import { db } from '../internals/firebase';
import {
  OrganizationDocument,
  OrganizationDocPermissions,
  OrganizationPermissions,
  UserDocPermissions
} from './types';
import { StakeholderDocument } from '@blockframes/organization/stakeholder/types';

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
  const stakeholders = await getCollection<StakeholderDocument>(`${collection}/${documentId}/stakeholders`);
  const promises = stakeholders.map(({ id }) => getDocument<OrganizationDocument>(`orgs/${id}`));
  return Promise.all(promises);
}

/** Create organization permissions on a shared document (owned by another organization) */
export function createOrganizationDocPermissions(
  params: Partial<OrganizationDocPermissions>
): OrganizationDocPermissions {
  return {
    canCreate: false,
    canDelete: false,
    canRead: true,
    canUpdate: false,
    id: '',
    owner: false, // TODO: Find a way to get the real ownerId (or stick to the boolean if it's overcomplicating things) => ISSUE#637
    ...params
  };
}

/** Create user related permissions on a shared document (owned by another organization) */
export function createUserDocPermissions(
  params: Partial<UserDocPermissions>
): UserDocPermissions {
  return {
    admins: [],
    canCreate: [],
    canDelete: [],
    canRead: [],
    canUpdate: [],
    id: '',
    ...params
  };
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
export async function getSuperAdmins(organizationId: string): Promise<string[]> {
  const permissionsRef = db.collection('permissions').doc(organizationId);
  const permissionsDoc = await permissionsRef.get();

  if (!permissionsDoc.exists) {
    throw new Error(`organization: ${organizationId} does not exists`);
  }

  const { superAdmins } = permissionsDoc.data() as OrganizationPermissions;
  return superAdmins;
}
