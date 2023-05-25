import {
  Notification,
  PublicUser,
  PublicOrganization,
  PermissionsDocument,
  createStorageFile,
  getAllAppsExcept,
  Invitation,
  Movie,
  Organization
} from '@blockframes/model';
import { removeUnexpectedUsers } from './users';
import {
  Auth,
  QueryDocumentSnapshot,
  getDocument,
  runChunks,
  removeAllSubcollections,
  UserRecord,
  toDate,
  getAuth
} from '@blockframes/firebase-utils';
import admin from 'firebase-admin';
import { DatabaseData, loadAllCollections, printDatabaseInconsistencies } from './internals/utils';
import { deleteSelectedUsers } from '@blockframes/testing/unit-tests';
import { subDays, subYears } from 'date-fns';

export const numberOfDaysToKeepNotifications = 14;
const EMPTY_MEDIA = createStorageFile();
let verbose = false;

/** Reusable data cleaning script that can be updated along with data model */
export async function cleanDeprecatedData(
  db: FirebaseFirestore.Firestore,
  auth?: admin.auth.Auth,
  options = { verbose: true }
) {
  verbose = options.verbose;
  // Getting all collections we need to check
  const { dbData, collectionData } = await loadAllCollections(db);

  // Data consistency check before cleaning data
  await printDatabaseInconsistencies({ dbData, collectionData }, undefined, { printDetail: false });

  // Actual cleaning
  if (verbose) console.log('Cleaning data');
  await cleanData(dbData, db, auth);

  // Data consistency check after cleaning data
  await printDatabaseInconsistencies(undefined, db, { printDetail: false });

  return true;
}

export async function auditUsers(db: FirebaseFirestore.Firestore, auth = getAuth()) {

  const { dbData } = await loadAllCollections(db);

  const organizationIds = dbData.orgs.refs.docs.map(ref => ref.id);

  console.log('Auditing users...');
  await cleanUsers(dbData.users.refs, organizationIds, dbData.permissions.refs, auth, { dryRun: true });
  console.log('Audit ended.');

  return true;
}

async function cleanData(dbData: DatabaseData, db: FirebaseFirestore.Firestore, auth?: admin.auth.Auth) {

  // Getting existing document ids to compare
  const [movieIds, organizationIds, eventIds, invitationIds, offerIds, contractIds, waterfallIds] = [
    dbData.movies.refs.docs.map((ref) => ref.id),
    dbData.orgs.refs.docs.map((ref) => ref.id),
    dbData.events.refs.docs.map((ref) => ref.id),
    dbData.invitations.refs.docs.map((ref) => ref.id),
    dbData.offers.refs.docs.map((ref) => ref.id),
    dbData.contracts.refs.docs.map((ref) => ref.id),
    dbData.waterfall.refs.docs.map((ref) => ref.id),
  ];

  // Compare and update/delete documents with references to non existing documents
  if (auth) await cleanUsers(dbData.users.refs, organizationIds, dbData.permissions.refs, auth);
  if (verbose) console.log('Cleaned users');

  // Loading users list after "cleanUsers" since some may have been removed
  const users = await db.collection('users').get();
  const userIds = users.docs.map((ref) => ref.id);
  await cleanOrganizations(dbData.orgs.refs, userIds, dbData.movies.refs);
  if (verbose) console.log('Cleaned orgs');

  // Loading orgs list after "cleanOrganizations" since some may have been removed
  const organizations2 = await db.collection('orgs').get();
  const organizationIds2 = organizations2.docs.map((ref) => ref.id);
  const existingIds = movieIds.concat(
    organizationIds2,
    eventIds,
    userIds,
    invitationIds,
    offerIds,
    contractIds,
    waterfallIds
  );

  await cleanPermissions(dbData.permissions.refs, organizationIds2, userIds, db);
  if (verbose) console.log('Cleaned permissions');
  await cleanMovies(dbData.movies.refs, organizationIds2);
  if (verbose) console.log('Cleaned movies');
  await cleanDocsIndex(dbData.docsIndex.refs, movieIds.concat(eventIds), organizationIds2);
  if (verbose) console.log('Cleaned docsIndex');
  await cleanNotifications(dbData.notifications.refs, existingIds, db);
  if (verbose) console.log('Cleaned notifications');
  await cleanInvitations(dbData.invitations.refs, existingIds, db);
  if (verbose) console.log('Cleaned invitations');
}

export function cleanNotifications(
  notifications: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[],
  db: FirebaseFirestore.Firestore
) {
  return runChunks(
    notifications.docs,
    async (doc: QueryDocumentSnapshot) => {
      const notification = toDate<Notification>(doc.data());
      const outdatedNotification = !isNotificationValid(notification, existingIds);
      if (outdatedNotification) {
        await doc.ref.delete();
      } else {
        await cleanOneNotification(doc, notification, db);
      }
    },
    undefined,
    verbose
  );
}

async function cleanOneNotification(
  doc: QueryDocumentSnapshot,
  notification: Notification,
  db: FirebaseFirestore.Firestore
) {
  if (notification.organization) {
    const d = await getDocument<PublicOrganization>(`orgs/${notification.organization.id}`, db);
    notification.organization.logo = d?.logo || EMPTY_MEDIA;
  }

  if (notification.user) {
    const d = await getDocument<PublicUser>(`users/${notification.user.uid}`, db);
    notification.user.avatar = d?.avatar || EMPTY_MEDIA;
  }

  await doc.ref.update(notification);
}

export function cleanInvitations(
  invitations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingIds: string[],
  db: FirebaseFirestore.Firestore
) {
  return runChunks(
    invitations.docs,
    async (doc: QueryDocumentSnapshot) => {
      const invitation = toDate<Invitation>(doc.data());
      const outdatedInvitation = !isInvitationValid(invitation, existingIds);
      if (outdatedInvitation) {
        await doc.ref.delete();
      } else {
        await cleanOneInvitation(doc, invitation, db);
      }
    },
    undefined,
    verbose
  );
}

async function cleanOneInvitation(
  doc: QueryDocumentSnapshot,
  invitation: Invitation,
  db: FirebaseFirestore.Firestore
) {
  if (invitation.fromOrg?.id) {
    const d = await getDocument<PublicOrganization>(`orgs/${invitation.fromOrg.id}`, db);
    invitation.fromOrg.logo = d?.logo || EMPTY_MEDIA;
  }

  if (invitation.toOrg?.id) {
    const d = await getDocument<PublicOrganization>(`orgs/${invitation.toOrg.id}`, db);
    invitation.toOrg.logo = d?.logo || EMPTY_MEDIA;
  }

  if (invitation.fromUser?.uid) {
    const d = await getDocument<PublicUser>(`users/${invitation.fromUser.uid}`, db);
    invitation.fromUser.avatar = d?.avatar || EMPTY_MEDIA;
    delete (invitation.fromUser as any).watermark;
  }

  if (invitation.toUser?.uid) {
    const d = await getDocument<PublicUser>(`users/${invitation.toUser.uid}`, db);
    invitation.toUser.avatar = d?.avatar || EMPTY_MEDIA;
    delete (invitation.toUser as any).watermark;
  }

  await doc.ref.update(invitation);
}

export async function cleanUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingOrganizationIds: string[],
  permissions: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  auth: Auth,
  options = { dryRun: false }
) {
  if (options.dryRun) verbose = true;
  // Check if auth users have their record on DB
  await removeUnexpectedUsers(users.docs.map(u => toDate<PublicUser>(u.data())), auth, options);

  const authUsersToDelete: string[] = [];

  await runChunks(users.docs, async (userDoc: FirebaseFirestore.DocumentSnapshot) => {
    const user = toDate<PublicUser>(userDoc.data());

    // Check if a DB user have a record in Auth.
    const authUser: UserRecord = await auth.getUserByEmail(user.email).catch(() => undefined);

    if (authUser) {
      const validUser = isUserValid(user, authUser, permissions.docs.map(p => p.data() as PermissionsDocument));
      // Check if ids are the same
      if (authUser.uid !== user.uid) {
        if (verbose) console.error(`ERR - uid missmatch for ${user.email}. db: ${user.uid} - auth : ${authUser.uid}`);
      } else if (!validUser) {
        if (verbose) {
          console.log(`DB - Too old user "${user.uid}" will be deleted`);
          console.log(`AUTH - Too old user "${user.uid}" will be deleted`);
        }

        if (!options.dryRun) {
          authUsersToDelete.push(authUser.uid);
          await userDoc.ref.delete();
        }
      } else if (user.orgId && !existingOrganizationIds.includes(user.orgId)) {
        if (verbose) console.error(`DB - invalid orgId "${user.orgId}" for user ${user.uid}`);
        delete user.orgId;
        if (!options.dryRun) await userDoc.ref.set(user);
      }
    } else {
      // User is deleted, we don't delete or update other documents as orgs, permissions, notifications etc
      // because this will be handled in the next parts of the script (cleanOrganizations, cleanPermissions, etc)
      // related storage documents will also be deleted in the cleanStorage and algolia will be updated at end of "upgrade" process
      if (verbose) console.log(`DB - Deleting user not found in AUTH : ${user.uid}.`);
      if (!options.dryRun) await userDoc.ref.delete();
    }
  }, undefined, verbose);

  return deleteSelectedUsers(auth, authUsersToDelete);
}

export function cleanOrganizations(
  organizations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingUserIds: string[],
  existingMovies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  return runChunks(
    organizations.docs,
    async (orgDoc) => {
      const org = toDate<Organization>(orgDoc.data());

      const { userIds = [], wishlist = [] } = org as Organization;

      const validUserIds = Array.from(
        new Set(userIds.filter((userId) => existingUserIds.includes(userId)))
      );
      if (validUserIds.length === 0) {
        // Org is deleted, we don't delete or update other documents as permissions, notifications, movies etc
        // because this will be handled in the next parts of the script (cleanPermissions, cleanInvitations etc)
        // related storage documents will also be deleted in the cleanStorage and algolia will be updated at end of "upgrade" process
        if (verbose) console.log(`Deleting org : ${org.id}.`);
        return orgDoc.ref.delete();
      } else if (validUserIds.length !== userIds.length) {
        await orgDoc.ref.update({ userIds: validUserIds });
      }

      const existingAndValidMovieIds = existingMovies.docs
        .filter((m) => {
          const movie = toDate<Movie>(m.data());
          return getAllAppsExcept(['crm']).some((a) => movie.app[a].status === 'accepted');
        })
        .map((m) => m.id);

      const validMovieIds = Array.from(
        new Set(wishlist.filter((movieId) => existingAndValidMovieIds.includes(movieId)))
      );
      if (validMovieIds.length !== wishlist.length) {
        await orgDoc.ref.update({ wishlist: validMovieIds });
      }
    },
    undefined,
    verbose
  );
}

export function cleanPermissions(
  permissions: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  existingOrganizationIds: string[],
  existingUserIds: string[],
  db: FirebaseFirestore.Firestore
) {
  return runChunks(
    permissions.docs,
    async (permissionDoc) => {
      const permission = permissionDoc.data() as PermissionsDocument;
      const invalidPermission = !existingOrganizationIds.includes(permission.id);
      if (invalidPermission) {
        await permissionDoc.ref.delete();
        const batch = db.batch();
        await removeAllSubcollections(permissionDoc, batch, db, { verbose: false });
        await batch.commit();
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
    },
    undefined,
    verbose
  );
}

export function cleanMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  organizationIds: string[]
) {
  return runChunks(
    movies.docs,
    async (movieDoc) => {
      const movie = toDate<Movie>(movieDoc.data());

      let updateDoc = false;

      // Remove duplicates
      const uniqueOrgIds = Array.from(new Set(movie.orgIds));
      const hasDuplicate = movie.orgIds && uniqueOrgIds.length !== movie.orgIds.length;
      if (hasDuplicate) {
        movie.orgIds = uniqueOrgIds;
        updateDoc = true;
      }

      // Removes orgs that does not exists
      if (!!movie.orgIds && movie.orgIds.some((o) => !organizationIds.includes(o))) {
        movie.orgIds = movie.orgIds.filter((o) => organizationIds.includes(o));
        updateDoc = true;
      }

      if (updateDoc) {
        await movieDoc.ref.set(movie);
      }
    },
    undefined,
    verbose
  );
}

export function cleanDocsIndex(
  docsIndex: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  moviesAndEventsIds: string[],
  organizationIds: string[]
) {
  return runChunks(
    docsIndex.docs,
    async (doc) => {
      const isDocLinkedToMoviesOrEvents = moviesAndEventsIds.includes(doc.id);
      const isDocLinkedToOrgs = organizationIds.includes(doc.data().authorOrgId);
      if (!isDocLinkedToMoviesOrEvents || !isDocLinkedToOrgs) {
        await doc.ref.delete();
      }
    },
    undefined,
    verbose
  );
}

/**
 * Check each type of notification and return false if a referenced document doesn't exist
 * @param notification the notification to check
 * @param existingIds the ids to compare with notification fields
 */
function isNotificationValid(notification: Notification, existingIds: string[]): boolean {
  if (!existingIds.includes(notification.toUserId)) return false;

  // Cleaning notifications more than n days
  const notificationTimestamp = notification._meta.createdAt.getTime();
  if (notificationTimestamp < subDays(Date.now(), numberOfDaysToKeepNotifications).getTime()) {
    return false;
  }

  if (notification.organization?.id && !existingIds.includes(notification.organization?.id))
    return false;
  if (notification.user?.uid && !existingIds.includes(notification.user?.uid)) return false;
  if (notification.docId && !existingIds.includes(notification.docId)) return false; // docId can refer to : events, offers, movies, orgs, contracts, waterfalls
  if (notification.invitation?.id && !existingIds.includes(notification.invitation?.id))
    return false;
  if (notification.bucket?.id && !existingIds.includes(notification.bucket?.id)) return false; // buckets Ids are orgs Ids
  if (notification.offerId && !existingIds.includes(notification.offerId)) return false;

  return true;
}

/**
 * Check each type of invitation and return false if a referenced document doesn't exist
 * @param invitation the invitation to check
 * @param existingIds the ids to compare with invitation fields
 */
function isInvitationValid(invitation: Invitation, existingIds: string[]): boolean {
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
    case 'joinOrganization': {
      // Cleaning not pending invitations older than n days
      const invitationTimestamp = invitation.date.getTime();
      if (
        invitation.status !== 'pending' &&
        invitationTimestamp < subDays(Date.now(), numberOfDaysToKeepNotifications).getTime()
      ) {
        return false;
      }
      return (
        (existingIds.includes(invitation.fromOrg?.id) &&
          existingIds.includes(invitation.toUser?.uid)) ||
        (existingIds.includes(invitation.fromUser?.uid) &&
          existingIds.includes(invitation.toOrg?.id))
      );
    }
    case 'joinWaterfall': {
      // Cleaning not pending invitations older than n days
      const invitationTimestamp = invitation.date.getTime();
      if (
        invitation.status !== 'pending' &&
        invitationTimestamp < subDays(Date.now(), numberOfDaysToKeepNotifications).getTime()
      ) {
        return false;
      }
      return (
        (existingIds.includes(invitation.fromOrg?.id) &&
          existingIds.includes(invitation.toUser?.uid) &&
          existingIds.includes(invitation.waterfallId)) ||
        (existingIds.includes(invitation.fromUser?.uid) &&
          existingIds.includes(invitation.toOrg?.id) &&
          existingIds.includes(invitation.waterfallId))
      );
    }
    default:
      return false;
  }
}

function isUserValid(
  user: PublicUser,
  authUser: UserRecord,
  permissions: PermissionsDocument[]
) {
  const now = new Date();

  // User does not have orgId and was created more than 90 days ago
  const creationTimeTimestamp = Date.parse(authUser.metadata.creationTime);
  const ninetyDaysAgo = subDays(now, 90).getTime();
  if (!user.orgId && creationTimeTimestamp < ninetyDaysAgo) {
    // User never connected
    if (!authUser.metadata.lastSignInTime) return false;

    // User have not signed in within the last 90 days
    const lastSignInTime = Date.parse(authUser.metadata.lastSignInTime);
    if (lastSignInTime < ninetyDaysAgo) return false;

    // Still considered as active user
    return true;
  }

  // If account is older than 3 years and 30 days
  const threeYearsAgo = subYears(now, 3);
  const threeYearsAndAMonthAgo = subDays(threeYearsAgo, 30).getTime();
  if (creationTimeTimestamp < threeYearsAndAMonthAgo) {
    // User never connected
    if (!authUser.metadata.lastSignInTime) return false;

    // User have not signed in within the last 3 years
    const lastSignInTime = Date.parse(authUser.metadata.lastSignInTime);
    if (lastSignInTime < threeYearsAndAMonthAgo) {
      if (!user.orgId) return false;
      // Check if not superAdmin
      const permission = permissions.find(p => p.id === user.orgId);
      if (!permission) {
        if (verbose) console.log(`Permission document not found for user ${user.uid}, orgId: ${user.orgId}`);
        return false;
      }

      if (permission.roles[user.uid] === 'superAdmin') {
        if (verbose) console.log(`User ${user.uid} was not removed because he is superAdmin of orgId: ${user.orgId}`);
        return true;
      } else {
        return false;
      }
    };
  }

  return true;
}
