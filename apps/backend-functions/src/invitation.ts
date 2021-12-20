import { getDocument, createPublicOrganizationDocument, createPublicUserDocument } from './data/internals';
import { getUser } from "./internals/utils";
import { db } from './internals/firebase'
import { InvitationOrUndefined, OrganizationDocument } from './data/types';
import { onInvitationToJoinOrgUpdate, onRequestToJoinOrgUpdate } from './internals/invitations/organizations';
import { onInvitationToAnEventUpdate } from './internals/invitations/events';
import { InvitationBase, createInvitation } from '@blockframes/invitation/+state/invitation.firestore';
import { createPublicUser, PublicUser } from '@blockframes/user/+state/user.firestore';
import { getOrInviteUserByMail } from './internals/users';
import { ErrorResultResponse } from './utils';
import { CallableContext } from "firebase-functions/lib/providers/https";
import { App } from '@blockframes/utils/apps';
import { EventDocument, EventMeta, MEETING_MAX_INVITATIONS_NUMBER } from '@blockframes/event/+state/event.firestore';
import { getEventEmailData } from '@blockframes/utils/emails/utils';
import { Change } from 'firebase-functions';
import { AlgoliaOrganization } from '@blockframes/utils/algolia';
import { createAlgoliaOrganization } from '@blockframes/firebase-utils';
export { hasUserAnOrgOrIsAlreadyInvited } from './internals/invitations/utils';


/**
 * Handles firestore updates on an invitation object,
 *
 * Check the data, manage processed ids (to prevent duplicates events in functions),
 * and dispatch to the correct piece of code depending on the invitation type.
 */
export async function onInvitationWrite(
  change: Change<FirebaseFirestore.DocumentSnapshot>
) {
  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const invitationDocBefore = before.data() as InvitationOrUndefined;
  const invitationDoc = after.data() as InvitationOrUndefined;

  // Doc was deleted
  if (!invitationDoc) {

    if (!!invitationDocBefore.toUser && invitationDocBefore.type === 'joinOrganization') {
      const user = await getUser(invitationDocBefore.toUser.uid);

      // Remove user in users collection
      if (invitationDocBefore.mode === "invitation" && !!user && invitationDocBefore.status === "pending") {

        // Fetch potential other invitations to this user
        const invitationCollectionRef = db.collection('invitations')
          .where('toUser.uid', '==', user.uid)
          .where('mode', '==', 'invitation')
          .where('status', '==', 'pending');
        const existingInvitation = await invitationCollectionRef.get();

        // If there is an other invitation or the user has already an org, we don't want to delete its account
        if (existingInvitation.docs.length >= 1 || !!user.orgId || !!user.firstName || !!user.lastName) {
          return;
        }

        db.doc(`users/${user.uid}`).delete();
      }
    }

    return;
  }

  // Because of rules restrictions, event creator might not have access to other informations than the id.
  // We consolidate invitation document here.
  let needUpdate = false;
  if (invitationDoc.fromOrg?.id && !invitationDoc.fromOrg?.denomination.full) {
    const org = await getDocument<OrganizationDocument>(`orgs/${invitationDoc.fromOrg.id}`);
    invitationDoc.fromOrg = createPublicOrganizationDocument(org);
    needUpdate = true;
  }

  if (invitationDoc.toOrg?.id && !invitationDoc.toOrg?.denomination.full) {
    const org = await getDocument<OrganizationDocument>(`orgs/${invitationDoc.toOrg.id}`);
    invitationDoc.toOrg = createPublicOrganizationDocument(org);
    needUpdate = true;
  }

  if (invitationDoc.fromUser?.uid && (!invitationDoc.fromUser.firstName || !invitationDoc.fromUser.email)) {
    const user = await getUser(invitationDoc.fromUser?.uid);
    invitationDoc.fromUser = createPublicUserDocument(user);
    needUpdate = true;
  }

  if (invitationDoc.toUser?.uid && (!invitationDoc.toUser.firstName || !invitationDoc.toUser.email)) {
    const user = await getUser(invitationDoc.toUser?.uid);
    invitationDoc.toUser = createPublicUserDocument(user);
    needUpdate = true;
  }

  try {
    // dispatch to the correct events depending on the invitation type & mode.
    switch (invitationDoc.type) {
      case 'joinOrganization':
        invitationDoc.mode === 'invitation'
          ? await onInvitationToJoinOrgUpdate(invitationDocBefore, invitationDoc, invitationDoc)
          : await onRequestToJoinOrgUpdate(invitationDocBefore, invitationDoc, invitationDoc);
        break;
      case 'attendEvent':
        /**
         * @dev In this case, an invitation to an event can be:
         * a request from an user who wants to attend an event.
         * an invitation to an user that can be interested to attend an event.
         */
        await onInvitationToAnEventUpdate(invitationDocBefore, invitationDoc, { ...invitationDoc, id: before.id });
        break;
      default:
        console.log(`Unhandled invitation: ${JSON.stringify(invitationDoc)}`);
        break;
    }

    if (needUpdate) {
      await db.doc(`invitations/${invitationDoc.id}`).set(invitationDoc);
    }
  } catch (e) {
    console.error('Invitation management thrown: ', e);
    throw e;
  }
}

interface UserInvitation {
  emails: string[];
  invitation: Partial<InvitationBase<Date>>;
  app?: App;
}

/**
 * Invite a list of user by email.
 * @dev this function polyfills the Promise.allSettled
 */
export const inviteUsers = async (data: UserInvitation, context: CallableContext) => {
  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }
  const user = await getDocument<PublicUser>(`users/${context.auth.uid}`);
  if (!user.orgId) { throw new Error('Permission denied: missing org id.'); }

  const promises: ErrorResultResponse[] = [];
  const invitation = createInvitation(data.invitation);

  // Ensure that we are not violating invitations limit
  if (invitation.type === 'attendEvent') {
    const eventId = invitation.eventId;
    if (eventId) {

      const event = await getDocument<EventDocument<EventMeta>>(`events/${eventId}`);

      // for now only meetings have a limitation
      if (event.type === 'meeting') {

        // count the number of already existing invitations
        const query = db.collection('invitations').where('eventId', '==', eventId);
        const querySnap = await query.get();

        // assert that we don"t go over the limit
        if (querySnap.size + data.emails.length > MEETING_MAX_INVITATIONS_NUMBER) {
          throw new Error(
            `MEETING MAX INVITATIONS EXCEEDED : Meeting ${eventId} has already ${querySnap.size} invitations
            and user ${user.uid} tried to add ${data.emails.length} new invitations.
            That would have exceeded the current limit which is ${MEETING_MAX_INVITATIONS_NUMBER} invitations.`)
        }
      }
    }
  }

  const eventId = invitation.type === 'attendEvent' && invitation.eventId;
  const event = eventId ? await getDocument<EventDocument<EventMeta>>(`events/${eventId}`) : undefined;

  for (const email of data.emails) {
    const invitationId = db.collection('invitations').doc().id;
    const { type, mode, fromOrg } = invitation;
    const eventData = type == 'attendEvent' ? getEventEmailData(event, email, invitationId) : undefined;
    const user = await getOrInviteUserByMail(
      email,
      { id: invitationId, type, mode, fromOrg },
      data.app,
      eventData
    )

    if (user.invitationStatus) invitation.status = user.invitationStatus;

    const publicUser = createPublicUser(user.user);
    invitation.toUser = publicUser;
    invitation.id = invitationId;

    try {
      const invitationSet = await db.collection('invitations').doc(invitation.id).set(invitation);
      promises.push({ result: invitationSet, id: invitation.id, error: '' });
    } catch (error) {
      promises.push({ result: undefined, error });
    }
  }

  return promises;
}

export async function getInvitationLinkedToEmail(email: string): Promise<boolean | AlgoliaOrganization> {
  const invitationRef = await db.collection('invitations')
    .where('toUser.email', '==', email)
    .where('status', '==', 'pending')
    .where('mode', '==', 'invitation')
    .where('type', '==', 'joinOrganization')
    .get();

  const joinOrgInvit = invitationRef.docs;

  // We want to return invitation to join organization in priority
  if (joinOrgInvit.length) {
    const invit = joinOrgInvit[0].data();
    const org = await getDocument<OrganizationDocument>(`orgs/${invit.fromOrg.id}`);
    return createAlgoliaOrganization(org);
  }

  const userRef = await db.collection('users').where('email', '==', email).get();
  if (userRef.docs.length === 1) {
    const user = userRef.docs[0].data();

    if (!user.firstName && !user.lastName) {
      if (user.orgId) {
        // If user was created along with org in CRM (without invitation)
        const org = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);
        return createAlgoliaOrganization(org);
      } else {
        return true;
      }
    }
  }

  return false;
}