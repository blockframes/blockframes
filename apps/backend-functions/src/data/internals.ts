/**
 * Collection & Document manipulation
 *
 * This code deals directly with the low level parts of firebase,
 */
import * as admin from 'firebase-admin';
import { InvitationDocument, OrganizationDocument } from './types';
import { PermissionsDocument } from '@blockframes/permissions/+state/permissions.firestore';
import { ContractDocument } from '@blockframes/contract/contract/+state/contract.firestore';
import { createDenomination } from '@blockframes/organization/+state/organization.firestore';
import { App, getOrgAppAccess, getSendgridFrom, applicationUrl } from '@blockframes/utils/apps';
import { EmailJSON } from '@sendgrid/helpers/classes/email-address';
import { getDocument } from '@blockframes/firebase-utils';
import { PublicInvitation } from '@blockframes/invitation/+state/invitation.firestore';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';

export { getDocument };

export function createPublicOrganizationDocument(org: OrganizationDocument) {
  return {
    id: org.id ?? '',
    denomination: createDenomination(org.denomination),
    logo: createStorageFile(org.logo),
    activity: org.activity ?? null,
  }
}

export function createPublicInvitationDocument(invitation: InvitationDocument) {
  return {
    id: invitation.id ?? '',
    type: invitation.type ?? '',
    mode: invitation.mode ?? '',
    status: invitation.status ?? '',
  } as PublicInvitation
}

export function createPublicUserDocument(user: any = {}) {
  return {
    uid: user.uid,
    email: user.email,
    avatar: createStorageFile(user.avatar),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    orgId: user.orgId ?? ''
  }
}

type Timestamp = admin.firestore.Timestamp;

export function createDocumentMeta(meta: Partial<DocumentMeta<Timestamp>> = {}): DocumentMeta<Timestamp> {
  return {
    createdBy: 'internal',
    createdAt: admin.firestore.Timestamp.now(),
    ...meta
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
  const db = admin.firestore();
  const movie = await db.doc(`movies/${movieId}`).get();
  const orgIds = movie.data().orgIds;
  const promises = orgIds.map(id => db.doc(`orgs/${id}`).get())
  const orgs = await Promise.all(promises);
  return orgs.map((orgDoc: any) => orgDoc.data())
}

/** Retrieve the list of superAdmins and admins of an organization */
export async function getAdminIds(organizationId: string): Promise<string[]> { // @TODO #4046 this may be removed at the end
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
export async function getFromEmail(_org: OrganizationDocument | string): Promise<EmailJSON> {
  const key = await getOrgAppKey(_org);
  return getSendgridFrom(key);
}
