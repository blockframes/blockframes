/**
 * Collection & Document manipulation
 *
 * This code deals directly with the low level parts of firebase,
 */
import { db } from '../internals/firebase';
import { OrganizationDocument } from './types';
import { PermissionsDocument } from '@blockframes/permissions/+state/permissions.firestore';
import { ContractDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { createHostedMedia } from '@blockframes/media/+state/media.firestore';
import { createDenomination } from '@blockframes/organization/+state/organization.firestore';
import { App, getOrgAppAccess, getSendgridFrom, applicationUrl } from '@blockframes/utils/apps';
import { EmailData } from '@sendgrid/helpers/classes/email-address';

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

export function createPublicOrganizationDocument(org: OrganizationDocument) {
  return {
    id: org.id || '',
    denomination: createDenomination(org.denomination),
    logo: createHostedMedia(org.logo)
  }
}

export function createPublicUserDocument(user: any = {}) {
  return {
    uid: user.uid,
    email: user.email,
    avatar: createHostedMedia(user.avatar),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    orgId: user.orgId || ''
  }
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

/**
 * Return the first app name that an org have access to
 * @param _org
 */
export async function getOrgAppKey(_org: OrganizationDocument | string): Promise<App> {
  if (typeof _org === 'string') {
    const org = await getDocument<OrganizationDocument>(`orgs/${_org}`);
    return getOrgAppAccess(org)[0];
  } else {
    return getOrgAppAccess(_org)[0];
  };
}

/**
 *  This guess the app from the org app access and returns the url of the app to use
 * @param _org
 */
export async function getAppUrl(_org: OrganizationDocument | string): Promise<string> {
  const key = await getOrgAppKey(_org);
  return applicationUrl[key];
}

/**
 * This guess the app from the org app access and returns the "from" email address to use
 * @param _org
 */
export async function getFromEmail(_org: OrganizationDocument | string): Promise<EmailData> {
  const key = await getOrgAppKey(_org);
  return getSendgridFrom(key);
}

