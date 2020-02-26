/**
 * Collection & Document manipulation
 *
 * This code deals directly with the low level parts of firebase,
 */
import { db } from '../internals/firebase';
import { OrganizationDocument, StakeholderDocument } from './types';
import { PermissionsDocument, UserRole } from '@blockframes/permissions/types';
import { ContractDocument, ContractVersionDocument } from '@blockframes/contract/contract/+state/contract.firestore';

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
  const promises = stakeholders.map(({ orgId }) => getDocument<OrganizationDocument>(`orgs/${orgId}`));
  return Promise.all(promises);
}

/**
 * Gets all the organizations from contract.partyIds
 * @param contract
 * @returns the organizations that are in the contract
 */
export async function getOrganizationsOfContract(contract: ContractDocument): Promise<OrganizationDocument[]> {
  const promises = contract.partyIds.map(orgId => getDocument<OrganizationDocument>(`orgs/${orgId}`));
  return Promise.all(promises);
}

/**
 * Gets all the organizations of a movie document
 * @param movieId
 * @returns the organizations that have movie id in organization.movieIds
 */
export async function getOrganizationsOfMovie(movieId: string): Promise<OrganizationDocument[]> {
  const organizations = await db.collection(`orgs`).where('movieIds', 'array-contains', movieId).get();
  const promises = organizations.docs.map(org => org.data() as OrganizationDocument);
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

/** Retrieve the list of superAdmins and admins of an organization */
export async function getAdminIds(organizationId: string): Promise<string[]> {
  const permissions = await getDocument<PermissionsDocument>(`permissions/${organizationId}`);

  if (!permissions) {
    throw new Error(`organization: ${organizationId} does not exists`);
  }

  const adminIds = Object.keys(permissions.roles).filter(userId => {
    return (
      permissions.roles[userId] === 'superAdmin' ||
      permissions.roles[userId] === 'admin'
    );
  });
  return adminIds;
}

export function versionExists(contractId: string, versionId: string) {
  const version = getDocument<ContractVersionDocument>(`contracts/${contractId}/versions/${versionId}`);
  return !!version
}
