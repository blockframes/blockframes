import { loadAdminServices } from './admin';
import { NotificationDocument } from '@blockframes/notification/types';
import { InvitationDocument } from '@blockframes/invitation/+state/invitation.firestore';
import { User } from '@blockframes/user/types';
import { OrganizationDocument } from '@blockframes/organization/+state/organization.firestore';
import { PermissionsDocument } from '@blockframes/permissions/+state/permissions.firestore';

export async function cleanDeprecatedData() {
  const { db } = loadAdminServices();

  // Getting all collections we need to check
  const [
    notifications,
    invitations,
    events,
    movies,
    organizations,
    users,
    permissions
  ] = await Promise.all([
    db.collection('notifications').get(),
    db.collection('invitations').get(),
    db.collection('events').get(),
    db.collection('movies').get(),
    db.collection('orgs').get(),
    db.collection('users').get(),
    db.collection('permissions').get()
  ]);

  // Getting existing document ids to compare
  const [movieIds, organizationIds, eventIds, userIds] = await Promise.all([
    movies.docs.map(movie => movie.data().id),
    organizations.docs.map(organization => organization.data().id),
    events.docs.map(event => event.data().id),
    users.docs.map(user => user.data().uid)
  ]);

  const existingIds = movieIds.concat(organizationIds, eventIds, userIds);

  // Compare and update/delete documents with references to non existing documents
  return Promise.all([
    cleanNotifications(notifications, existingIds),
    cleanInvitations(invitations, existingIds),
    cleanUsers(users, organizationIds),
    cleanOrganizations(organizations, userIds, movieIds),
    cleanPermissions(permissions, organizationIds)
  ]);
}

function cleanNotifications(
  notifications: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[]
) {
  notifications.docs.map(async doc => {
    const notification = doc.data() as NotificationDocument;
    const outdatedNotification = !isNotificationValid(notification, existingIds);
    if (outdatedNotification) {
      await doc.ref.delete();
    }
  });
}

function cleanInvitations(
  invitations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[]
) {
  invitations.docs.map(async doc => {
    const invitation = doc.data() as InvitationDocument;
    const outdatedInvitation = !isInvitationValid(invitation, existingIds);
    if (outdatedInvitation) {
      await doc.ref.delete();
    }
  });
}

function cleanUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingOrganizationIds: string[]
) {
  users.docs.map(async userDoc => {
    const user = userDoc.data() as User;
    const invalidOrganization = !existingOrganizationIds.includes(user.orgId);
    if (invalidOrganization) {
      delete user.orgId;
      await userDoc.ref.update(user);
    }
  });
}

function cleanOrganizations(
  organizations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingUserIds: string[],
  existingMovieIds: string[]
) {
  organizations.docs.map(async orgDoc => {
    const { userIds, movieIds } = orgDoc.data() as OrganizationDocument;

    const validUserIds = userIds.filter(userId => existingUserIds.includes(userId));
    if (validUserIds.length !== userIds.length) {
      await orgDoc.ref.update({ userIds: validUserIds });
    }

    const validMovieIds = movieIds.filter(movieId => existingMovieIds.includes(movieId));
    if (validMovieIds.length !== movieIds.length) {
      await orgDoc.ref.update({ movieIds: validMovieIds });
    }
  });
}

function cleanPermissions(
  permissions: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingOrganizationIds: string[]
) {
  permissions.docs.map(async permissionDoc => {
    const { id } = permissionDoc.data() as PermissionsDocument;
    const invalidPermission = !existingOrganizationIds.includes(id);
    if (invalidPermission) {
      await permissionDoc.ref.delete();
    }
  });
}

/**
 * Check each type of notification and return false if a referenced document doesn't exist
 * @param notification the notification to check
 * @param existingIds the ids to compare with notification fields
 */
function isNotificationValid(notification: NotificationDocument, existingIds: string[]): boolean {
  if (!existingIds.includes(notification.toUserId)) return false;

  // Since notification have fields depending on its type, we need to check those specific fields
  switch (notification.type) {
    case 'organizationAcceptedByArchipelContent':
      return existingIds.includes(notification.organization?.id);
    case 'invitationFromUserToJoinOrgDecline':
    case 'memberAddedToOrg':
    case 'memberRemovedFromOrg':
      return (
        existingIds.includes(notification.organization?.id) &&
        existingIds.includes(notification.user?.uid)
      );
    case 'movieSubmitted':
    case 'movieAccepted':
    case 'contractInNegotiation':
    case 'invitationToAttendEventAccepted':
    case 'invitationToAttendEventDeclined':
      return existingIds.includes(notification.docId);
    case 'newContract':
      return (
        existingIds.includes(notification.docId) &&
        existingIds.includes(notification.organization?.id)
      );
    case 'requestToAttendEventSent':
      return (
        existingIds.includes(notification.user?.uid) && existingIds.includes(notification.docId)
      );
    default:
      return false;
  }
}

/**
 * Check each type of invitation and return false if a referenced document doesn't exist
 * @param invitation the invitation to check
 * @param existingIds the ids to compare with invitation fields
 */
function isInvitationValid(invitation: InvitationDocument, existingIds: string[]): boolean {
  switch (invitation.type) {
    case 'attendEvent':
      return (
        (existingIds.includes(invitation.fromOrg?.id) &&
          existingIds.includes(invitation.toUser?.uid) &&
          existingIds.includes(invitation.docId)) ||
        (existingIds.includes(invitation.fromUser?.uid) &&
          existingIds.includes(invitation.toOrg?.id) &&
          existingIds.includes(invitation.docId))
      );
    case 'joinOrganization':
      return (
        (existingIds.includes(invitation.fromOrg?.id) && existingIds.includes(invitation.toUser?.uid)) ||
        (existingIds.includes(invitation.fromUser?.uid) && existingIds.includes(invitation.toOrg?.id))
      );
    default:
      return false;
  }
}
