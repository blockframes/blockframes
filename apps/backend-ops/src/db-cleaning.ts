import { NotificationDocument } from '@blockframes/notification/+state/notification.firestore';
import { InvitationDocument } from '@blockframes/invitation/+state/invitation.firestore';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { OrganizationDocument, PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { PermissionsDocument } from '@blockframes/permissions/+state/permissions.firestore';
import { removeUnexpectedUsers } from './users';
import { Auth, Firestore, QueryDocumentSnapshot, getDocument, runChunks } from '@blockframes/firebase-utils';
import admin from 'firebase-admin';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
import { getAllAppsExcept } from '@blockframes/utils/apps';
import { DatabaseData, loadAllCollections, printDatabaseInconsistencies } from './internals/utils';

export const numberOfDaysToKeepNotifications = 14;
const currentTimestamp = new Date().getTime();
export const dayInMillis = 1000 * 60 * 60 * 24;
const EMPTY_MEDIA = createStorageFile();
let verbose = false;

// @TODO #6460 not existing users found in movies._meta.createdBy ..
// @TODO #6460 spot database inconsistency + users without org + org.userIds = user.orgId + movie.orgIds => exists
// @TODO #6460 check document subcollection of permissions ?
// @TODO #6460 perform a new shrinked db to check that everything is ok

// @TODO #6460 remove 
// npm run backend-ops importFirestore LATEST-ANON-DB
// npm run backend-ops syncUsers

/** Reusable data cleaning script that can be updated along with data model */
export async function cleanDeprecatedData(db: FirebaseFirestore.Firestore, auth?: admin.auth.Auth, options = { verbose: true }) {
  verbose = options.verbose;
  // Getting all collections we need to check
  const { dbData, collectionData } = await loadAllCollections(db);

  // Data consistency check before cleaning data
  await printDatabaseInconsistencies({ dbData, collectionData }, undefined, { verbose: false });

  // Actual cleaning
  console.log('Cleaning data');
  await cleanData(dbData, db, auth);

  // Data consistency check after cleaning data
  await printDatabaseInconsistencies(undefined, db, { verbose: false });

  return true;
}

export async function auditDatabaseConsistency(db: FirebaseFirestore.Firestore, options = { verbose: true }) {
  await printDatabaseInconsistencies(undefined, db, options);
  return true;
}

async function cleanData(dbData: DatabaseData, db: FirebaseFirestore.Firestore, auth?: admin.auth.Auth) {

  // Getting existing document ids to compare
  const [movieIds, organizationIds, eventIds, userIds, invitationIds, offerIds] = [
    dbData.movies.refs.docs.map(ref => ref.id),
    dbData.orgs.refs.docs.map(ref => ref.id),
    dbData.events.refs.docs.map(ref => ref.id),
    dbData.users.refs.docs.map(ref => ref.id),
    dbData.invitations.refs.docs.map(ref => ref.id),
    dbData.offers.refs.docs.map(ref => ref.id),
  ];

  // Compare and update/delete documents with references to non existing documents
  if (auth) await cleanUsers(dbData.users.refs, organizationIds, auth, db);
  if (verbose) console.log('Cleaned users');
  await cleanOrganizations(dbData.orgs.refs, userIds, dbData.movies.refs);
  if (verbose) console.log('Cleaned orgs');

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

  const existingIds = movieIds.concat(organizationIds2, eventIds, userIds2, invitationIds, offerIds);

  await cleanPermissions(dbData.permissions.refs, organizationIds, userIds2);
  if (verbose) console.log('Cleaned permissions');
  await cleanMovies(dbData.movies.refs);
  if (verbose) console.log('Cleaned movies');
  await cleanDocsIndex(dbData.docsIndex.refs, existingIds);
  if (verbose) console.log('Cleaned docsIndex');
  await cleanNotifications(dbData.notifications.refs, existingIds);
  if (verbose) console.log('Cleaned notifications');
  await cleanInvitations(dbData.invitations.refs, existingIds);
  if (verbose) console.log('Cleaned invitations');
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
  }, undefined, verbose);
}

async function cleanOneNotification(doc: QueryDocumentSnapshot, notification: NotificationDocument) {
  if (notification.organization) {
    const d = await getDocument<PublicOrganization>(`orgs/${notification.organization.id}`);
    notification.organization.logo = d?.logo || EMPTY_MEDIA;
  }

  if (notification.user) {
    const d = await getDocument<PublicUser>(`users/${notification.user.uid}`);
    notification.user.avatar = d?.avatar || EMPTY_MEDIA;
  }

  await doc.ref.update(notification);
}

export function cleanInvitations(
  invitations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[],
) {
  return runChunks(invitations.docs, async (doc: QueryDocumentSnapshot) => {
    const invitation = doc.data() as InvitationDocument;
    const outdatedInvitation = !isInvitationValid(invitation, existingIds);
    if (outdatedInvitation) {
      await doc.ref.delete();
    } else {
      await cleanOneInvitation(doc, invitation);
    }
  }, undefined, verbose);
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
    delete (invitation.fromUser as any).watermark;
  }

  if (invitation.toUser?.uid) {
    const d = await getDocument<PublicUser>(`users/${invitation.toUser.uid}`);
    invitation.toUser.avatar = d?.avatar || EMPTY_MEDIA;
    delete (invitation.toUser as any).watermark;
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
  await removeUnexpectedUsers(users.docs.map(u => u.data() as PublicUser), auth);

  return runChunks(users.docs, async (userDoc: FirebaseFirestore.DocumentSnapshot) => {
    const user = userDoc.data() as PublicUser;

    // Check if a DB user have a record in Auth.
    const authUserId = await auth.getUserByEmail(user.email).then(u => u.uid).catch(() => undefined);
    if (authUserId) {
      // Check if ids are the same
      if (authUserId !== user.uid) {
        if (verbose) console.error(`uid mistmatch for ${user.email}. db: ${user.uid} - auth : ${authUserId}`);
      } else if (!existingOrganizationIds.includes(user.orgId)) {
        delete user.orgId;
        await userDoc.ref.set(user);
      }
    } else {
      // User does not exists on auth, should be deleted.
      if (!user.orgId || !existingOrganizationIds.includes(user.orgId)) {
        await userDoc.ref.delete();  // @TODO #6460 clean org delete with cascade
        if (verbose) console.log(`Deleted ${user.uid}.`);
      } else {
        const orgDoc = await db.doc(`orgs/${user.orgId}`).get();
        const org = orgDoc.data() as OrganizationDocument;
        const userIds = org.userIds.filter(u => u !== user.uid);
        await orgDoc.ref.update({ userIds });
        const permDoc = await db.doc(`permissions/${user.orgId}`).get();
        const permission = permDoc.data() as PermissionsDocument;
        if (permission) {
          delete permission.roles[user.uid];
          await permDoc.ref.update({ roles: permission.roles });
        }
        await userDoc.ref.delete(); // @TODO #6460 clean org delete with cascade
        if (verbose) console.log(`Deleted ${user.uid} and cleaned org and permissions ${user.orgId}.`);
      }
    }
  }, undefined, verbose);
}

export function cleanOrganizations(
  organizations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingUserIds: string[],
  existingMovies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
) {
  return runChunks(organizations.docs, async (orgDoc) => {
    const org = orgDoc.data();

    if (org.members) {
      delete org.members;
      await orgDoc.ref.set(org);
    }

    const { userIds = [], wishlist = [] } = org as OrganizationDocument;

    const validUserIds = Array.from(new Set(userIds.filter(userId => existingUserIds.includes(userId))));
    /* @TODO #5371 #6460
    if (validUserIds.length === 0) {
      // Removes permissions and orgs doc
      const permissionRef = await getDocumentRef(`permissions/${org.id}`);
      if (verbose) console.log(`Deleting org and permissions ${org.id}.`);
      return Promise.all([permissionRef.ref.delete(), orgDoc.ref.delete()]); // @TODO #6460 clean org delete with cascade
    } else */if (validUserIds.length !== userIds.length) {
      await orgDoc.ref.update({ userIds: validUserIds });
    }

    const existingAndValidMovieIds = existingMovies.docs.filter(m => {
      const movie = m.data();
      return getAllAppsExcept(['crm']).some(a => movie.app[a].status === 'accepted');
    }).map(m => m.id);

    const validMovieIds = Array.from(new Set(wishlist.filter(movieId => existingAndValidMovieIds.includes(movieId))));
    if (validMovieIds.length !== wishlist.length) {
      await orgDoc.ref.update({ wishlist: validMovieIds });
    }
  }, undefined, verbose);
}

export function cleanPermissions(
  permissions: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingOrganizationIds: string[],
  existingUserIds: string[]
) {
  return runChunks(permissions.docs, async (permissionDoc) => {
    const permission = permissionDoc.data() as PermissionsDocument;
    const invalidPermission = !existingOrganizationIds.includes(permission.id);
    if (invalidPermission) {
      await permissionDoc.ref.delete();
    } else {
      const userIds = Object.keys(permission.roles);
      let updateDoc = false;
      for (const uid of userIds) {
        if (!existingUserIds.includes(uid)) {
          delete permission.roles[uid];
          updateDoc = true;
        }
      }

      if (updateDoc) {
        await permissionDoc.ref.set(permission);
      }
    }
  }, undefined, verbose);
}

export function cleanMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  return runChunks(movies.docs, async (movieDoc) => {
    const movie = movieDoc.data();

    let updateDoc = false;

    if (movie.distributionRights) {
      delete movie.distributionRights;
      updateDoc = true;
    }

    if (!!movie.orgIds && Array.from(new Set(movie.orgIds)).length !== movie.orgIds.length) {
      movie.orgIds = Array.from(new Set(movie.orgIds));
      updateDoc = true;
    }

    if (updateDoc) {
      await movieDoc.ref.set(movie);
    }

  }, undefined, verbose);
}

export function cleanDocsIndex(
  docsIndex: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[]
) {

  return runChunks(docsIndex.docs, async (doc) => {
    if (!existingIds.includes(doc.id)) {
      await doc.ref.delete();
    }
  }, undefined, verbose);

}

/**
 * Check each type of notification and return false if a referenced document doesn't exist
 * @param notification the notification to check
 * @param existingIds the ids to compare with notification fields
 */
function isNotificationValid(notification: NotificationDocument, existingIds: string[]): boolean {
  if (!existingIds.includes(notification.toUserId)) return false;

  // Cleaning notifications more than n days
  const notificationTimestamp = notification._meta.createdAt.toMillis();
  if (notificationTimestamp < currentTimestamp - (dayInMillis * numberOfDaysToKeepNotifications)) {
    return false;
  }

  if (notification.organization?.id && !existingIds.includes(notification.organization?.id)) return false;
  if (notification.user?.uid && !existingIds.includes(notification.user?.uid)) return false;
  if (notification.docId && !existingIds.includes(notification.docId)) return false; // docId can refer to : events, offers, movies, orgs
  if (notification.invitation?.id && !existingIds.includes(notification.invitation?.id)) return false;
  if (notification.bucket?.id && !existingIds.includes(notification.bucket?.id)) return false; // buckets Ids are orgs Ids

  return true;
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
          existingIds.includes(invitation.eventId)) ||
        (existingIds.includes(invitation.fromUser?.uid) &&
          existingIds.includes(invitation.toOrg?.id) &&
          existingIds.includes(invitation.eventId))
      );
    case 'joinOrganization':
      {
        // Cleaning not pending invitations older than n days
        const invitationTimestamp = invitation.date.toMillis();
        if (invitation.status !== 'pending' && invitationTimestamp < currentTimestamp - (dayInMillis * numberOfDaysToKeepNotifications)) {
          return false;
        }
        return (
          (existingIds.includes(invitation.fromOrg?.id) && existingIds.includes(invitation.toUser?.uid)) ||
          (existingIds.includes(invitation.fromUser?.uid) && existingIds.includes(invitation.toOrg?.id))
        );
      }
    default:
      return false;
  }
}
