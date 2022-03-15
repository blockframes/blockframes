/**
 * Collection & Document manipulation
 *
 * This code deals directly with the low level parts of firebase,
 */
import * as admin from 'firebase-admin';
import { App, getOrgAppAccess } from '@blockframes/utils/apps';
import { getDocument } from '@blockframes/firebase-utils';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
import { createDenomination, OrganizationDocument, PublicUser, InvitationDocument, PublicInvitation, PermissionsDocument, DocumentMeta } from '@blockframes/model';

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

export function createPublicUserDocument(user: Partial<PublicUser> = {}) {
  return {
    uid: user.uid,
    email: user.email,
    avatar: createStorageFile(user.avatar),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    orgId: user.orgId ?? ''
  }
}

export type Timestamp = admin.firestore.Timestamp;

export function createDocumentMeta(meta: Partial<DocumentMeta<Timestamp>> = {}): DocumentMeta<Timestamp> {
  return {
    createdBy: 'internal',
    createdAt: admin.firestore.Timestamp.now(),
    ...meta
  }
}

/**
 * Gets all the organizations of a movie document
 * @param movieId
 * @returns the organizations that have movie id in organization.movieIds
 */
export async function getOrganizationsOfMovie(movieId: string) {
  const db = admin.firestore();
  const movie = await db.doc(`movies/${movieId}`).get();
  const orgIds = movie.data().orgIds;
  const promises = orgIds.map(id => db.doc(`orgs/${id}`).get())
  const orgs = await Promise.all(promises);
  return orgs.map((orgDoc: FirebaseFirestore.DocumentSnapshot<OrganizationDocument>) => orgDoc.data())
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
