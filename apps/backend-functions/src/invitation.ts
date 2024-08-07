﻿import { getUser } from './internals/utils';
import { db } from './internals/firebase'
import { onInvitationToJoinOrgUpdate, onRequestToJoinOrgUpdate } from './internals/invitations/organizations';
import { onInvitationToAnEventUpdate } from './internals/invitations/events';
import {
  createPublicUser,
  PublicUser,
  Event,
  EventMeta,
  MEETING_MAX_INVITATIONS_NUMBER,
  createInvitation,
  InvitationStatus,
  AlgoliaOrganization,
  App,
  ErrorResultResponse,
  Invitation,
  createPublicOrganization,
  Organization,
  getEventEmailData,
  Movie,
  getWaterfallEmailData,
  SupportedLanguages,
} from '@blockframes/model';
import { getOrInviteUserByMail } from './internals/users';
import { CallableContext } from 'firebase-functions/v1/https';
import { createAlgoliaOrganization } from '@blockframes/firebase-utils/algolia';
import { BlockframesChange, getDocument } from '@blockframes/firebase-utils';
import { applicationUrl, sendgridEmailsFrom } from '@blockframes/utils/apps';
import { onInvitationToWaterfallUpdate } from './internals/invitations/waterfall';
export { hasUserAnOrgOrIsAlreadyInvited } from './internals/invitations/utils';

/**
 * Handles firestore updates on an invitation object,
 *
 * Check the data, manage processed ids (to prevent duplicates events in functions),
 * and dispatch to the correct piece of code depending on the invitation type.
 */
export async function onInvitationWrite(change: BlockframesChange<Invitation>) {
  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const invitationDocBefore = before.data();
  const invitationDoc = after.data();

  // Doc was deleted
  if (!invitationDoc) {
    if (!!invitationDocBefore.toUser && invitationDocBefore.type === 'joinOrganization') {
      const user = await getUser(invitationDocBefore.toUser.uid);

      // Remove user in users collection
      if (invitationDocBefore.mode === 'invitation' && !!user && invitationDocBefore.status === 'pending') {
        // Fetch potential other invitations to this user
        const invitationCollectionRef = db
          .collection('invitations')
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
  if (invitationDoc.fromOrg?.id && !invitationDoc.fromOrg?.name) {
    const org = await getDocument<Organization>(`orgs/${invitationDoc.fromOrg.id}`);
    invitationDoc.fromOrg = createPublicOrganization(org);
    needUpdate = true;
  }

  if (invitationDoc.toOrg?.id && !invitationDoc.toOrg?.name) {
    const org = await getDocument<Organization>(`orgs/${invitationDoc.toOrg.id}`);
    invitationDoc.toOrg = createPublicOrganization(org);
    needUpdate = true;
  }

  if (invitationDoc.fromUser?.uid && (!invitationDoc.fromUser.firstName || !invitationDoc.fromUser.email)) {
    const user = await getUser(invitationDoc.fromUser?.uid);
    invitationDoc.fromUser = createPublicUser(user);
    needUpdate = true;
  }

  if (invitationDoc.toUser?.uid && (!invitationDoc.toUser.firstName || !invitationDoc.toUser.email)) {
    const user = await getUser(invitationDoc.toUser?.uid);
    invitationDoc.toUser = createPublicUser(user);
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
      case 'attendEvent': {
        /**
         * @dev In this case, an invitation to an event can be:
         * a request from an user who wants to attend an event.
         * an invitation to an user that can be interested to attend an event.
         */
        await onInvitationToAnEventUpdate(invitationDocBefore, invitationDoc, { ...invitationDoc, id: before.id });
        // Update invitation only if status is not already updated (for public events that are accepted automatically)
        const invitation = await getDocument<Invitation>(`invitations/${invitationDoc.id}`);
        needUpdate = needUpdate && invitation.status === invitationDoc.status;
        break;
      }
      case 'joinWaterfall':
        await onInvitationToWaterfallUpdate(invitationDocBefore, invitationDoc, invitationDoc);
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

export interface UserInvitation {
  emails: string[];
  invitation: Partial<Invitation>;
  app?: App;
  language?: SupportedLanguages; // TODO #9699 update front to send language when needed
}

/**
 * Invite a list of user by email.
 * @dev this function polyfills the Promise.allSettled
 */
export const inviteUsers = async (data: UserInvitation, context: CallableContext) => {
  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  const user = await getDocument<PublicUser>(`users/${context.auth.uid}`);
  if (!user.orgId) throw new Error('Permission denied: missing org id.');

  const promises: ErrorResultResponse[] = [];
  const invitation = createInvitation(data.invitation);

  // Ensure that we are not violating invitations limit
  if (invitation.type === 'attendEvent') {
    const eventId = invitation.eventId;
    if (eventId) {
      const event = await getDocument<Event<EventMeta>>(`events/${eventId}`);

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
            That would have exceeded the current limit which is ${MEETING_MAX_INVITATIONS_NUMBER} invitations.`
          );
        }
      }
    }
  }

  const eventId = invitation.type === 'attendEvent' && invitation.eventId;
  const event = eventId ? await getDocument<Event<EventMeta>>(`events/${eventId}`) : undefined;
  const movie = invitation.waterfallId ? await getDocument<Movie>(`movies/${invitation.waterfallId}`) : undefined;

  for (const email of data.emails) {
    const invitationId = db.collection('invitations').doc().id;
    const { type, mode, fromOrg } = invitation;

    // Data for invitations to attendEvent
    const eventData = type == 'attendEvent' ? getEventEmailData({
      event,
      orgName: fromOrg.name,
      email,
      invitationId,
      organizerEmail: sendgridEmailsFrom.festival.email,
      applicationUrl: applicationUrl.festival
    }) : undefined;

    // Data for invitation to joinWaterfall
    const waterfallData = type === 'joinWaterfall' ? getWaterfallEmailData(movie) : undefined;

    const user = await getOrInviteUserByMail(email, { id: invitationId, type, mode, fromOrg }, data.app, eventData, waterfallData, data.language);

    if (user.invitationStatus) invitation.status = user.invitationStatus;

    const publicUser = createPublicUser(user.user);
    invitation.toUser = publicUser;
    invitation.id = invitationId;

    try {
      await db.collection('invitations').doc(invitation.id).set(invitation);
      promises.push({ result: invitation.id, error: '' });
    } catch (error) {
      promises.push({ result: undefined, error });
    }
  }

  return promises;
};

export async function getInvitationLinkedToEmail(email: string): Promise<boolean | AlgoliaOrganization> {
  const invitationRef = await db
    .collection('invitations')
    .where('toUser.email', '==', email)
    .where('status', '==', 'pending')
    .where('mode', '==', 'invitation')
    .where('type', '==', 'joinOrganization')
    .get();

  const joinOrgInvit = invitationRef.docs;

  // We want to return invitation to join organization in priority
  if (joinOrgInvit.length) {
    const invit = joinOrgInvit[0].data();
    const org = await getDocument<Organization>(`orgs/${invit.fromOrg.id}`);
    return createAlgoliaOrganization(org);
  }

  const userRef = await db.collection('users').where('email', '==', email).get();
  if (userRef.docs.length === 1) {
    const user = userRef.docs[0].data();

    if (!user.firstName && !user.lastName) {
      if (user.orgId) {
        // If user was created along with org in CRM (without invitation)
        const org = await getDocument<Organization>(`orgs/${user.orgId}`);
        return createAlgoliaOrganization(org);
      } else {
        return true;
      }
    }
  }

  return false;
}

export interface AnonymousInvitationAction {
  invitationId: string;
  email: string;
  status: InvitationStatus;
}

export const acceptOrDeclineInvitationAsAnonymous = async (data: AnonymousInvitationAction, context: CallableContext) => {
  if (!context?.auth) throw new Error('Permission denied: missing auth context.');

  const invitation = await getDocument<Invitation>(`invitations/${data.invitationId}`);

  if (!invitation || invitation.type !== 'attendEvent') throw new Error('Permission denied: invalid invitation');

  if (invitation.mode !== 'invitation' || invitation.toUser.email.toLowerCase() !== data.email.toLowerCase()) throw new Error('Permission denied: invalid invitation');

  invitation.status = data.status;

  await db.collection('invitations').doc(invitation.id).set(invitation);
  return true;
};
