import { loadAdminServices, Auth } from './admin';
import { NotificationDocument } from '@blockframes/notification/+state/notification.firestore';
import { InvitationDocument } from '@blockframes/invitation/+state/invitation.firestore';
import { User } from '@blockframes/user/+state/user.firestore';
import { OrganizationDocument } from '@blockframes/organization/+state/organization.firestore';
import { PermissionsDocument } from '@blockframes/permissions/+state/permissions.firestore';
import { EventMeta, EventDocument } from '@blockframes/event/+state/event.firestore';
import { removeUnexpectedUsers } from './users';
import { UserConfig } from './assets/users.fixture';
import { runChunks } from './tools';

const numberOfDaysToKeepNotifications = 14;
const currentTimestamp = new Date().getTime();
const dayInMillis = 1000 * 60 * 60 * 24;
/** 
 * @dev This is the date of a mystic event from the ancient times which led to madness the most relentless developers.
 * This is also known as the date of an incomplete image migration affecting invitations and notifications (src: wikipedia).
*/
const imagesMigrationTimestamp = Date.parse('2020-06-24T08:00:00');

/** Reusable data cleaning script that can be updated along with data model */
export async function cleanDeprecatedData() {
  const { db, auth } = loadAdminServices();

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
  const [movieIds, organizationIds, eventIds, userIds] = await Promise.all([
    movies.docs.map(movie => movie.data().id),
    organizations.docs.map(organization => organization.data().id),
    events.docs.map(event => event.data().id),
    users.docs.map(user => user.data().uid)
  ]);

  const existingIds = movieIds.concat(organizationIds, eventIds, userIds);

  // Compare and update/delete documents with references to non existing documents
  await cleanNotifications(notifications, existingIds);
  console.log('Cleaned notifications');
  await cleanInvitations(invitations, existingIds, events.docs.map(event => event.data() as EventDocument<EventMeta>));
  console.log('Cleaned invitations');
  await cleanUsers(users, organizationIds, auth);
  console.log('Cleaned users');
  await cleanOrganizations(organizations, userIds, movieIds);
  console.log('Cleaned orgs');
  await cleanPermissions(permissions, organizationIds);
  console.log('Cleaned permissions');
  await cleanMovies(movies);
  console.log('Cleaned movies');
  await cleanDocsIndex(docsIndex, existingIds);
  console.log('Cleaned docsIndex');

  return true;
}

function cleanNotifications(
  notifications: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[]
) {

  return runChunks(notifications.docs, async (doc) => {
    const notification = doc.data() as any; // @TODO (#3175) w8 "final" doc structure
    const outdatedNotification = !isNotificationValid(notification, existingIds);
    if (outdatedNotification) {
      await doc.ref.delete();
    } else {
      // Updating ImgRef if notification created before Jun 24 2020 (image migration) 
      // @dev If the cleaning is made after Jun 24 + imagesMigrationTimestamp, this should have no effects
      // @dev This should also have no effect if hotfix/1.6.3 have been deployed
      const notificationTimestamp = notification.date.toMillis();
      if (notificationTimestamp < imagesMigrationTimestamp) {
        if (notification.organization) {
          notification.organization.logo = '';
        } else if (notification.user) {
          notification.user.avatar = '';
        }
        await doc.ref.update(notification);
      } else {
        // @TODO (#3175] use org logo or user avatar
      }
    }
  });

}

function cleanInvitations(
  invitations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[],
  events: EventDocument<EventMeta>[],
) {
  return runChunks(invitations.docs, async (doc) => {
    const invitation = doc.data() as any; // @TODO (#3175) w8 "final" doc structure
    const outdatedInvitation = !isInvitationValid(invitation, existingIds, events);
    if (outdatedInvitation) {
      await doc.ref.delete();
    } else {
      // Clearing ImgRef if invitation created before Jun 24 2020 (image migration) 
      // @TODO (#3066) mock an invitation created before Jun 24
      const invitationTimestamp = invitation.date.toMillis();

      if (invitationTimestamp < imagesMigrationTimestamp) {
        if (invitation.fromOrg) {
          invitation.fromOrg.logo = '';
        }
        if (invitation.toOrg) {
          invitation.toOrg.logo = '';
        }
        if (invitation.fromUser) {
          invitation.fromUser.avatar = '';
        }
        if (invitation.toUser) {
          invitation.toUser.avatar = '';
        }
        await doc.ref.update(invitation);
      } else {
        // @TODO (#3175] use org logo or user avatar
      }
    }
  });
}

async function cleanUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingOrganizationIds: string[],
  auth: Auth
) {

  // Check if auth users have their record on DB
  // @TODO (#3066) recreate this situation
  await removeUnexpectedUsers(users.docs.map(u => u.data() as UserConfig), auth);

  return runChunks(users.docs, async (userDoc) => {
    const user = userDoc.data() as User;

    // Check if a DB user have a record in Auth.
    // @TODO (#3066) recreate this situation
    const authUserId = await auth.getUserByEmail(user.email).then(u => u.uid).catch(_ => undefined);
    if (!!authUserId) {
      // Check if ids are the same 
      if (authUserId !== user.uid) {
        console.error(`uid mistmatch for ${user.email}. db: ${user.uid} - auth : ${authUserId}`);
      } else {
        const invalidOrganization = !existingOrganizationIds.includes(user.orgId);
        if (invalidOrganization) {
          delete user.orgId;
          await userDoc.ref.update(user);
        }

        let update: any = {};
        let updateObj = false;
        if (!user.avatar || (user as any).avatar?.original) {
          update.avatar = '';
          updateObj = true;
        }

        if ((user as any).watermark?.urls) {
          update.watermark = '';
          updateObj = true;
        }

        if (updateObj) {
          await userDoc.ref.update(update);
        }
      }
    } else {
      // User does not exists on auth, should be deleted.
      // @TODO (#3175) check if user can be deleted (permission, org etc)
      await userDoc.ref.delete();
    }
  });
}

function cleanOrganizations(
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

    const { userIds, movieIds, logo } = org as OrganizationDocument;

    const validUserIds = userIds.filter(userId => existingUserIds.includes(userId));
    if (validUserIds.length !== userIds.length) {
      await orgDoc.ref.update({ userIds: validUserIds });
    }

    const validMovieIds = movieIds.filter(movieId => existingMovieIds.includes(movieId));
    if (validMovieIds.length !== movieIds.length) {
      await orgDoc.ref.update({ movieIds: validMovieIds });
    }

    if (!logo || (logo as any).original) {
      await orgDoc.ref.update({ logo: '' });
    }

  });
}

function cleanPermissions(
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

function cleanMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  return runChunks(movies.docs, async (movieDoc) => {
    const movie = movieDoc.data() as any;

    // @TODO (#3066) mock a movie with distributionRights on root document to test deletion
    // @TODO (#3175) It seams that this object on root comes from an un-cleaned movie document from Akita that have been updated as is on DB.
    if (movie.distributionRights) {
      delete movie.distributionRights;
    }

    // @TODO (#3175] clean trailer link & old img ref structuires cf 1eJm06mvagJDNJ2yAlDt

    await movieDoc.ref.update(movie);
  });
}

function cleanDocsIndex(
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
  // @TODO (#3066) mock notifications with date > n days ||  date < n days and test deletion
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
        const event = events.find(e => e.id = invitation.docId);
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
      // Cleaning not pending invitations more than n days
      // @TODO (#3066) mock invitations not pending || pending and with date > n days ||  date < n days and test deletion
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