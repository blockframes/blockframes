import { Auth, Firestore, QueryDocumentSnapshot } from './admin';
import { NotificationDocument } from '@blockframes/notification/+state/notification.firestore';
import { InvitationDocument } from '@blockframes/invitation/+state/invitation.firestore';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { OrganizationDocument, PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { PermissionsDocument } from '@blockframes/permissions/+state/permissions.firestore';
import { EventMeta, EventDocument } from '@blockframes/event/+state/event.firestore';
import { removeUnexpectedUsers } from './users';
import { UserConfig } from './assets/users.fixture';
import { getDocument, startMaintenance, endMaintenance, runChunks } from '@blockframes/firebase-utils';
import { createHostedMedia } from '@blockframes/media/+state/media.firestore';
import admin from 'firebase-admin';

export const numberOfDaysToKeepNotifications = 14;
const currentTimestamp = new Date().getTime();
export const dayInMillis = 1000 * 60 * 60 * 24;

// @TODO #3066 once "final" media structure is ready, remplace by const EMPTY_MEDIA = ''. 
// Also update in unit test scripts
const EMPTY_MEDIA = createHostedMedia();

/** Reusable data cleaning script that can be updated along with data model */

export async function cleanDeprecatedData(db: FirebaseFirestore.Firestore, auth: admin.auth.Auth) {
  await startMaintenance();
  // Getting all collections we need to check
  const [
    notifications,
    invitations,
    events,
    movies,
    organizations,
    users,
    permissions,
    docsIndex
  ] = await Promise.all([
    db.collection('notifications').get(),
    db.collection('invitations').get(),
    db.collection('events').get(),
    db.collection('movies').get(),
    db.collection('orgs').get(),
    db.collection('users').get(),
    db.collection('permissions').get(),
    db.collection('docsIndex').get()
  ]);

  // Getting existing document ids to compare
  const [movieIds, organizationIds, eventIds, userIds] = [
    movies.docs.map(ref => ref.id),
    organizations.docs.map(ref => ref.id),
    events.docs.map(ref => ref.id),
    users.docs.map(ref => ref.id)
  ];

  // Compare and update/delete documents with references to non existing documents
  await cleanUsers(users, organizationIds, auth, db);
  console.log('Cleaned users');
  await cleanOrganizations(organizations, userIds, movieIds);
  console.log('Cleaned orgs');

  // Getting all collections we need to reload
  const [organizations2, users2] = await Promise.all([
    db.collection('orgs').get(),
    db.collection('users').get(),
  ]);

  // Reloading users and org list after possible deletion
  const [organizationIds2, userIds2] = [
    organizations2.docs.map(ref => ref.id),
    users2.docs.map(ref => ref.id)
  ];

  const existingIds = movieIds.concat(organizationIds2, eventIds, userIds2);

  await cleanPermissions(permissions, organizationIds);
  console.log('Cleaned permissions');
  await cleanMovies(movies);
  console.log('Cleaned movies');
  await cleanDocsIndex(docsIndex, existingIds);
  console.log('Cleaned docsIndex');
  await cleanNotifications(notifications, existingIds);
  console.log('Cleaned notifications');
  await cleanInvitations(invitations, existingIds, events.docs.map(event => event.data() as EventDocument<EventMeta>));
  console.log('Cleaned invitations');

  await endMaintenance();
  return true;
}

export function cleanNotifications(
  notifications: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[]
) {
  return runChunks(notifications.docs, async (doc: QueryDocumentSnapshot) => {
    const notification = doc.data() as NotificationDocument;
    const outdatedNotification = !isNotificationValid(notification, existingIds);
    if (outdatedNotification) {
      await doc.ref.delete();
    } else {
      await cleanOneNotification(doc, notification);
    }
  });
}

async function cleanOneNotification(doc: QueryDocumentSnapshot, notification: NotificationDocument) {
  if (notification.organization) {
    const d = await getDocument<PublicOrganization>(`orgs/${notification.organization.id}`);
    notification.organization.logo = d?.logo || EMPTY_MEDIA;
  }

  if (notification.user) {
    const d = await getDocument<PublicUser>(`users/${notification.user.uid}`);
    notification.user.avatar = d?.avatar || EMPTY_MEDIA;
    notification.user.watermark = d?.watermark || EMPTY_MEDIA;
  }

  await doc.ref.update(notification);
}

export function cleanInvitations(
  invitations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[],
  events: EventDocument<EventMeta>[],
) {
  return runChunks(invitations.docs, async (doc: QueryDocumentSnapshot) => {
    const invitation = doc.data() as InvitationDocument;
    const outdatedInvitation = !isInvitationValid(invitation, existingIds, events);
    if (outdatedInvitation) {
      await doc.ref.delete();
    } else {
      await cleanOneInvitation(doc, invitation);
    }
  });
}

async function cleanOneInvitation(doc: QueryDocumentSnapshot, invitation: InvitationDocument) {
  if (invitation.fromOrg?.id) {
    const d = await getDocument<PublicOrganization>(`orgs/${invitation.fromOrg.id}`);
    invitation.fromOrg.logo = d?.logo || EMPTY_MEDIA;
  }

  if (invitation.toOrg?.id) {
    const d = await getDocument<PublicOrganization>(`orgs/${invitation.toOrg.id}`);
    invitation.toOrg.logo = d?.logo || EMPTY_MEDIA;
  }

  if (invitation.fromUser?.uid) {
    const d = await getDocument<PublicUser>(`users/${invitation.fromUser.uid}`);
    invitation.fromUser.avatar = d?.avatar || EMPTY_MEDIA;
    invitation.fromUser.watermark = d?.watermark || EMPTY_MEDIA;
  }

  if (invitation.toUser?.uid) {
    const d = await getDocument<PublicUser>(`users/${invitation.toUser.uid}`);
    invitation.toUser.avatar = d?.avatar || EMPTY_MEDIA;
    invitation.toUser.watermark = d?.watermark || EMPTY_MEDIA;
  }

  await doc.ref.update(invitation);
}

export async function cleanUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingOrganizationIds: string[],
  auth: Auth,
  db: Firestore,
) {

  // Check if auth users have their record on DB
  await removeUnexpectedUsers(users.docs.map(u => u.data() as UserConfig), auth);

  return runChunks(users.docs, async (userDoc) => {
    const user = userDoc.data() as any;

    // Check if a DB user have a record in Auth.
    const authUserId = await auth.getUserByEmail(user.email).then(u => u.uid).catch(_ => undefined);
    if (!!authUserId) {
      // Check if ids are the same 
      if (authUserId !== user.uid) {
        console.error(`uid mistmatch for ${user.email}. db: ${user.uid} - auth : ${authUserId}`);
      } else {
        const invalidOrganization = !existingOrganizationIds.includes(user.orgId);
        let update = false;

        if (invalidOrganization) {
          delete user.orgId;
          update = true;
        }

        if (user.name) {
          delete user.name;
          update = true;
        }

        if (user.surname) {
          delete user.surname;
          update = true;
        }

        if (update) {
          await userDoc.ref.set(user);
        }
      }
    } else {
      // User does not exists on auth, should be deleted.
      if (!user.orgId || !existingOrganizationIds.includes(user.orgId)) {
        await userDoc.ref.delete();
        console.log(`Deleted ${user.uid}.`);
      } else {
        const orgDoc = await db.doc(`orgs/${user.orgId}`).get();
        const org = orgDoc.data() as OrganizationDocument;
        const userIds = org.userIds.filter(u => u !== user.uid);
        await orgDoc.ref.update({ userIds });
        const permDoc = await db.doc(`permissions/${user.orgId}`).get();
        const permission = permDoc.data() as PermissionsDocument;
        if (!!permission) {
          delete permission.roles[user.uid];
          await permDoc.ref.update({ roles: permission.roles });
        }
        await userDoc.ref.delete();
        console.log(`Deleted ${user.uid} and cleaned org and permissions ${user.orgId}.`);
      }
    }
  });
}

export function cleanOrganizations(
  organizations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingUserIds: string[],
  existingMovieIds: string[]
) {
  return runChunks(organizations.docs, async (orgDoc) => {
    const org = orgDoc.data();

    if (org.members) {
      delete org.members;
      await orgDoc.ref.set(org);
    }

    const { userIds, movieIds } = org as OrganizationDocument;

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

export function cleanPermissions(
  permissions: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingOrganizationIds: string[]
) {
  return runChunks(permissions.docs, async (permissionDoc) => {
    const { id } = permissionDoc.data() as PermissionsDocument;
    const invalidPermission = !existingOrganizationIds.includes(id);
    if (invalidPermission) {
      await permissionDoc.ref.delete();
    }
  });
}

export function cleanMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  return runChunks(movies.docs, async (movieDoc) => {
    const movie = movieDoc.data() as any;

    if (movie.distributionRights) {
      delete movie.distributionRights;
      await movieDoc.ref.set(movie);
    }

  });
}

export function cleanDocsIndex(
  docsIndex: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[]
) {

  return runChunks(docsIndex.docs, async (doc) => {
    if (!existingIds.includes(doc.id)) {
      await doc.ref.delete();
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

  // Cleaning notifications more than n days
  const notificationTimestamp = notification.date.toMillis();
  if (notificationTimestamp < currentTimestamp - (dayInMillis * numberOfDaysToKeepNotifications)) {
    return false;
  }

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
 * @param events the existing event documents
 */
function isInvitationValid(invitation: InvitationDocument, existingIds: string[], events: EventDocument<EventMeta>[]): boolean {

  switch (invitation.type) {
    case 'attendEvent':

      if (existingIds.includes(invitation.docId)) {
        const event = events.find(e => e.id === invitation.docId);
        const eventEndTimestamp = event.end.toMillis();

        // Cleaning finished events
        if (eventEndTimestamp < currentTimestamp) {
          return false;
        }
      }

      return (
        (existingIds.includes(invitation.fromOrg?.id) &&
          existingIds.includes(invitation.toUser?.uid) &&
          existingIds.includes(invitation.docId)) ||
        (existingIds.includes(invitation.fromUser?.uid) &&
          existingIds.includes(invitation.toOrg?.id) &&
          existingIds.includes(invitation.docId))
      );
    case 'joinOrganization':
      // Cleaning not pending invitations older than n days
      const invitationTimestamp = invitation.date.toMillis();
      if (invitation.status !== 'pending' && invitationTimestamp < currentTimestamp - (dayInMillis * numberOfDaysToKeepNotifications)) {
        return false;
      }
      return (
        (existingIds.includes(invitation.fromOrg?.id) && existingIds.includes(invitation.toUser?.uid)) ||
        (existingIds.includes(invitation.fromUser?.uid) && existingIds.includes(invitation.toOrg?.id))
      );
    default:
      return false;
  }
}