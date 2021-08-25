import { ContractDocument } from "@blockframes/contract/contract/+state";
import { defaultEmulatorBackupPath, endMaintenance, getFirestoreExportPath, latestAnonDbDir, latestAnonShrinkedDbDir, loadAdminServices, removeAllSubcollections, shutdownEmulator, startMaintenance } from "@blockframes/firebase-utils";
import { InvitationDocument } from "@blockframes/invitation/+state/invitation.firestore";
import { MovieDocument } from "@blockframes/movie/+state/movie.firestore";
import { NotificationDocument } from "@blockframes/notification/types";
import { OrganizationDocument } from "@blockframes/organization/+state";
import { PermissionsDocument } from "@blockframes/permissions/+state/permissions.firestore";
import { importEmulatorFromBucket, uploadBackup } from "./emulator";
import { backupBucket as ciBucketName } from 'env/env.blockframes-ci'

export async function shrinkDb() {
  const { db } = loadAdminServices({ emulator: true });

  // STEP 1 load-latest anon-db into emulator and keep it running with auth & firestore
  const proc = await importEmulatorFromBucket({ importFrom: `gs://${ciBucketName}/${latestAnonDbDir}`, keepEmulatorsAlive: true });

  // STEP 2 shrink DB
  await startMaintenance(db);
  await processDb(db);
  await endMaintenance(db);

  // STEP 3 shutdown emulator & export db
  await shutdownEmulator(proc, defaultEmulatorBackupPath);

  // STEP 3 upload to backup bucket
  await uploadBackup({ localRelPath: getFirestoreExportPath(defaultEmulatorBackupPath), remoteDir: latestAnonShrinkedDbDir });
}

export async function processDb(db: FirebaseFirestore.Firestore) {
  const [
    notifications,
    invitations,
    events,
    _movies,
    _organizations,
    _users,
    _permissions,
    docsIndex,
    _contracts,
    blockframesAdmin
  ] = await Promise.all([
    db.collection('notifications').get(),
    db.collection('invitations').get(),
    db.collection('events').get(),
    db.collection('movies').get(),
    db.collection('orgs').get(),
    db.collection('users').get(),
    db.collection('permissions').get(),
    db.collection('docsIndex').get(),
    db.collection('contracts').get(),
    db.collection('blockframesAdmin').get(),
    // @TODO #6460  campaigns, terms, buckets etc...
  ]);

  //////////////////
  // CHECK WHAT CAN BE DELETED
  //////////////////

  const movies = _movies.docs.map(d => d.data() as MovieDocument);
  const permissions = _permissions.docs.map(d => d.data() as PermissionsDocument);
  const contracts = _contracts.docs.map(d => d.data() as ContractDocument);

  const _usersLinkedToMovies = [];
  const _orgsLinkedToOtherDocuments = [];

  for (const movie of movies) {
    if (movie._meta.createdBy) {
      _usersLinkedToMovies.push(movie._meta.createdBy);
    }

    if (movie._meta.updatedBy) {
      _usersLinkedToMovies.push(movie._meta.updatedBy);
    }

    if (movie._meta.deletedBy) {
      _usersLinkedToMovies.push(movie._meta.deletedBy);
    }

    for (const orgId of movie.orgIds) {
      _orgsLinkedToOtherDocuments.push(orgId);
      _usersLinkedToMovies.push(getOrgSuperAdmin(orgId, permissions));
    }
  }

  for (const contract of contracts) {
    _orgsLinkedToOtherDocuments.push(contract.sellerId);
  }

  const usersToKeep = Array.from(new Set(_usersLinkedToMovies));
  const orgsToKeep = Array.from(new Set(_orgsLinkedToOtherDocuments));
  console.log('Users to keep', usersToKeep.length);
  console.log('Orgs to keep', orgsToKeep.length);

  // Remove invitations not linked to any org or users we want to keep
  const invitationsToKeep = [];
  for (const _invitation of invitations.docs) {
    const invitation = _invitation.data() as InvitationDocument;

    let keepInvitation = true;
    if (!!invitation.fromUser?.uid && !usersToKeep.includes(invitation.fromUser.uid)) {
      keepInvitation = false;
    }

    if (!!invitation.toUser?.uid && !usersToKeep.includes(invitation.toUser.uid)) {
      keepInvitation = false;
    }

    if (!!invitation.fromOrg?.id && !orgsToKeep.includes(invitation.fromOrg.id)) {
      keepInvitation = false;
    }

    if (!!invitation.toOrg?.id && !orgsToKeep.includes(invitation.toOrg.id)) {
      keepInvitation = false;
    }

    if (keepInvitation) {
      invitationsToKeep.push(invitation.id);
    }
  }

  console.log('Invitations to keep', invitationsToKeep.length);

  const notificationsToKeep = [];
  for (const _notification of notifications.docs) {
    const notification = _notification.data() as NotificationDocument;
    let keepNotification = true;

    if (!usersToKeep.includes(notification.toUserId)) {
      keepNotification = false;
    }

    if (!!notification.user && !usersToKeep.includes(notification.user.uid)) {
      keepNotification = false;
    }

    if (!!notification.invitation && !invitationsToKeep.includes(notification.invitation.id)) {
      keepNotification = false;
    }

    if (!!notification.organization && !orgsToKeep.includes(notification.organization.id)) {
      keepNotification = false;
    }

    if (keepNotification) {
      notificationsToKeep.push(notification.id);
    }
  }

  console.log('Notifications to keep', notificationsToKeep.length);


  //////////////////
  // ACTUAL DELETION
  //////////////////

  for (const _org of _organizations.docs) {
    if (!orgsToKeep.includes(_org.id)) {
      console.log(`Deleting org ${_org.id}`);
      await _org.ref.delete();
    } else {
      console.log(`Updating org ${_org.id}`);
      const org = _org.data() as OrganizationDocument;
      org.userIds = org.userIds.filter(uid => usersToKeep.includes(uid));
      await _org.ref.set(org);
    }
  }

  for (const _perm of _permissions.docs) {
    if (!orgsToKeep.includes(_perm.id)) {
      console.log(`Deleting perm ${_perm.id}`);
      await _perm.ref.delete();
      const batch = db.batch();
      await removeAllSubcollections(_perm, batch);
      await batch.commit();
    } else {
      console.log(`Updating perm ${_perm.id}`);
      const perm = _perm.data() as PermissionsDocument;

      const currentUsers = Object.keys(perm.roles);

      const roles = {};
      for (const orgUser of currentUsers) {
        if (usersToKeep.includes(orgUser)) {
          roles[orgUser] = perm.roles[orgUser];
        }
      }
      perm.roles = roles;
      await _perm.ref.set(perm);
    }
  }

  for (const _user of _users.docs) {
    if (!usersToKeep.includes(_user.id)) {
      console.log(`Deleting user ${_user.id}`);
      await _user.ref.delete();
    }
  }

  for (const bfAdmin of blockframesAdmin.docs) {
    if (!usersToKeep.includes(bfAdmin.id)) {
      console.log(`Deleting bfAdmin ${bfAdmin.id}`);
      await bfAdmin.ref.delete();
    }
  }
}


function getPermissionById(orgId: string, permissions: PermissionsDocument[]) {
  return permissions.find(o => o.id === orgId);
}

function getOrgSuperAdmin(orgId: string, permissions: PermissionsDocument[]) {
  const permission = getPermissionById(orgId, permissions);
  return Object.keys(permission.roles).find(userId => permission.roles[userId] === 'superAdmin')
}


function isUserMandatory() {
  //@TODO
}

