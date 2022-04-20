import { InvitationDocument, InvitationOrUndefined, invitationStatus } from '@blockframes/model';
import * as admin from 'firebase-admin';

/** Checks if an invitation just got accepted. */
export function wasAccepted(before: InvitationDocument, after: InvitationDocument) {
  return before?.status === 'pending' && after?.status === 'accepted';
}

/** Checks if an invitation just got declined. */
export function wasDeclined(before: InvitationDocument, after: InvitationDocument) {
  return before?.status === 'pending' && after?.status === 'declined';
}

/** Checks if an invitation just got created. */
export function wasCreated(before: InvitationOrUndefined, after: InvitationDocument) {
  return !before && !!after;
}

/**
 * @param userEmails array of emails
 * @returns boolean, true if the users have an org or there is an invitation to join organization for those emails
 */
 export async function hasUserAnOrgOrIsAlreadyInvited(userEmails: string[]) {
  const db = admin.firestore();
  const userPromises = userEmails.map(email => db.collection('users')
    .where('email', '==', email)
    .get());
  const userQuery = await Promise.all(userPromises);

  const hasUserAlreadyAnOrg = userQuery.some(d => d.docs && d.docs.some(u => !!u.data().orgId));
  if (hasUserAlreadyAnOrg) return true;

  const invitationPromises = userEmails.map(email => db.collection('invitations')
    .where('type', '==', 'joinOrganization')
    .where('toUser.email', '==', email)
    .where('status', 'in', Object.keys(invitationStatus).filter(s => s !== 'declined'))
    .get());
  const invitationQuery = await Promise.all(invitationPromises);

  return invitationQuery.some(d => d.docs.length > 0);
}

