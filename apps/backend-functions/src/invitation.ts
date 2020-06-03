import { getDocument, createPublicOrganizationDocument, createPublicUserDocument } from './data/internals';
import { db, functions, getUser } from './internals/firebase';
import { InvitationOrUndefined, OrganizationDocument } from './data/types';
import { onInvitationToJoinOrgUpdate, onRequestToJoinOrgUpdate } from './internals/invitations/organizations';
import { onInvitationToAnEventUpdate } from './internals/invitations/events';
import { InvitationBase, createInvitation } from '@blockframes/invitation/+state/invitation.firestore';
import { createPublicUser, PublicUser } from '@blockframes/user/+state/user.firestore';
import { getOrInviteUserByMail } from './internals/users';
import { ErrorResultResponse } from './utils';
import { CallableContext } from "firebase-functions/lib/providers/https";
import { App } from '@blockframes/utils/apps';

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
  invitation: Partial<InvitationBase<any>>;
  app?: App;
}

/**
 * Invite a list of user by email.
 * @dev this function polyfills the Promise.allSettled
 */
export const inviteUsers = (data: UserInvitation, context: CallableContext): Promise<any> => {
  return new Promise(async (res) => {

    if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }
    const user = await getDocument<PublicUser>(`users/${context.auth.uid}`);
    if (!user.orgId) { throw new Error('Permission denied: missing org id.'); }

    const promises: ErrorResultResponse[] = [];
    const invitation = createInvitation(data.invitation);
    for (const email of data.emails) {
      getOrInviteUserByMail(email, user.orgId, invitation.type, data.app)
        .then(u => createPublicUser(u))
        .then(toUser => {
          invitation.toUser = toUser;
          const id = db.collection('invitations').doc().id;
          invitation.id = id;
        })
        .then(_ => db.collection('invitations').doc(invitation.id).set(invitation))
        .then(result => promises.push({ result, error: '' }))
        .catch(error => promises.push({ result: undefined, error }))
        .then(lastIndex => {
          if (lastIndex === data.emails.length) {
            res(promises)
          }
        });
    }
  })
}
