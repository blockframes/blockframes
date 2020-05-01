import { getDocument } from './data/internals';
import { db, functions } from './internals/firebase';
import { InvitationOrUndefined, OrganizationDocument } from './data/types';
import { onInvitationToOrgUpdate, onInvitationFromUserToJoinOrgUpdate } from './internals/invitations/organizations';
import { onInvitationToAnEventUpdate } from './internals/invitations/events';
import { createDenomination } from '@blockframes/organization/+state/organization.firestore';
import { createImgRef } from '@blockframes/utils/image-uploader';

function createPublicOrganizationDocument(org: OrganizationDocument) {
  return {
    id: org.id || '',
    denomination: createDenomination(org.denomination),
    logo: createImgRef(org.logo)
  }
}

function createPublicUserDocument(user: any = {}) {
  return {
    uid: user.uid,
    email: user.email,
    avatar: createImgRef(user.avatar),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    orgId: user.orgId || ''
  }
}

/**
 * Handles firestore updates on an invitation object,
 *
 * Check the data, manage processed ids (to prevent duplicates events in functions),
 * and dispatch to the correct piece of code depending on the invitation type.
 */
export async function onInvitationWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>
) {
  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const invitationDocBefore = before.data() as InvitationOrUndefined;
  const invitationDoc = after.data() as InvitationOrUndefined;

  // Doc was deleted, ignoring...
  if (!invitationDoc) { return; }

  // Because of rules restrictions, event creator might not have access to other informations than the id.
  // We consolidate invitation document here.
  let needUpdate = false;
  if (invitationDoc.fromOrg?.id && !invitationDoc.fromOrg?.denomination.full) {
    const org = await getDocument<OrganizationDocument>(`orgs/${invitationDoc.fromOrg?.id}`);
    invitationDoc.fromOrg = createPublicOrganizationDocument(org);
    needUpdate = true;
  }

  if (invitationDoc.toOrg?.id && !invitationDoc.toOrg?.denomination.full) {
    const org = await getDocument<OrganizationDocument>(`orgs/${invitationDoc.toOrg?.id}`);
    invitationDoc.toOrg = createPublicOrganizationDocument(org);
    needUpdate = true;
  }

  if (invitationDoc.fromUser?.uid && !invitationDoc.fromUser.email) {
    const user = await getDocument(`users/${invitationDoc.fromUser?.uid}`);
    invitationDoc.fromUser = createPublicUserDocument(user);
    needUpdate = true;
  }

  if (invitationDoc.toUser?.uid && !invitationDoc.toUser.email) {
    const user = await getDocument(`users/${invitationDoc.toUser?.uid}`);
    invitationDoc.toUser = createPublicUserDocument(user);
    needUpdate = true;
  }

  if (needUpdate) {
    // We stop here, since we are gooing to enter into this trigger again
    return await db.doc(`invitations/${invitationDoc.id}`).set(invitationDoc);
  }

  try {
    // dispatch to the correct events depending on the invitation type & mode.
    switch (invitationDoc.type) {
      case 'joinOrganization':
        return invitationDoc.mode === 'invitation'
          ? onInvitationToOrgUpdate(invitationDocBefore, invitationDoc, invitationDoc)
          : onInvitationFromUserToJoinOrgUpdate(invitationDocBefore, invitationDoc, invitationDoc);
      case 'attendEvent':
        /**
         * @dev In this case, an invitation to an event can be:
         * a request from an user who wants to attend an event.
         * an invitation to an user that can be interested to attend an event.
         */
        return onInvitationToAnEventUpdate(invitationDocBefore, invitationDoc, { ...invitationDoc, id: before.id });
      default:
        throw new Error(`Unhandled invitation: ${JSON.stringify(invitationDoc)}`);
    }
  } catch (e) {
    console.error('Invitation management thrown: ', e);
    throw e;
  }
}
