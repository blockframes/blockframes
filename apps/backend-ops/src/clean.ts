import { loadAdminServices } from "./admin";
import { NotificationDocument } from "@blockframes/notification/types";
import { InvitationDocument } from "@blockframes/invitation/+state/invitation.firestore";
import { User } from "@blockframes/user/types";
import { OrganizationDocument } from "@blockframes/organization/+state/organization.firestore";
import { PermissionsDocument } from "@blockframes/permissions/+state/permissions.firestore";

export async function cleanDeprecatedData() {
  const { db } = loadAdminServices();

  // Getting all collections we need to check
  const [notifications, invitations, events, movies, organizations, users, permissions] = await Promise.all([
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
    cleanPermissions(permissions, organizationIds),
  ])
}

function cleanNotifications(notifications: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>, existingIds: string[]) {
  notifications.docs.map(async doc => {
    const notification = doc.data() as NotificationDocument;
    const outdatedNotification = !existingIds.includes(
      notification.toUserId || notification.user.uid || notification.organization.id ||
      notification.docId || notification.movie.id
    )
    if (outdatedNotification) {
      await doc.ref.delete();
    }
    return true;
  })
}

function cleanInvitations(invitations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>, existingIds: string[]) {
  invitations.docs.map(async doc => {
    const invitation = doc.data() as InvitationDocument;
    const outdatedInvitation = !existingIds.includes(
      invitation.toUser.uid || invitation.fromUser.uid || invitation.docId ||
      invitation.toOrg.id || invitation.fromOrg.id
    )
    if (outdatedInvitation) {
      await doc.ref.delete();
    }
    return true;
  })
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
    return true;
  })
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
    return true;
  })
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
    return true;
  })
}
