import { endMaintenance, latestAnonDbDir, latestAnonShrinkedDbDir, removeAllSubcollections, startMaintenance } from "@blockframes/firebase-utils";
import { connectFirestoreEmulator, defaultEmulatorBackupPath, firebaseEmulatorExec, getFirestoreExportPath, importFirestoreEmulatorBackup, shutdownEmulator } from "@blockframes/firebase-utils/firestore/emulator";
import { OrganizationDocument } from "@blockframes/organization/+state";
import { PermissionsDocument } from "@blockframes/permissions/+state/permissions.firestore";
import { uploadBackup } from "./emulator";
import { backupBucket as ciBucketName } from 'env/env.blockframes-ci'
import { backupBucket } from '@env'

// Users for E2E tests
import staticUsers from 'tools/static-users.json';
import { EIGHT_MINUTES_IN_MS } from "@blockframes/utils/maintenance";
import type { ChildProcess } from "child_process";
import { CollectionData, DatabaseData, DocumentDescriptor, getAllDocumentCount, inspectDocumentRelations, loadAllCollections, printDatabaseInconsistencies } from "./internals/utils";
import { cleanDeprecatedData } from "./db-cleaning";

/**
 * Temp this should be removed when fixtures are updated. 
 *  - libs/e2e/src/lib/fixtures/users.ts
 *  - libs/e2e/src/lib/utils/screenings.ts
 */
const USERS = [
  'MDnN2GlVUeadIVJbzTToQQNAMWZ2',
  '2OJUZoWtTVcew27YDZa8FQQdg5q2',
  'K0ZCSd8bhwcNd9Bh9xJER9eP2DQ2',
  'B8UsXliuxwY6ztjtLuh6f7UD1GV2',
  'qFbytROWQYWJplzck42RLdgAr3K3',
  'mVUZ097xoAeubsPiQlqrzgUF8y83'
];

export async function loadAndShrinkLatestAnonDbAndUpload() {
  let proc: ChildProcess;
  try {
    // STEP 1 load-latest anon-db into emulator and keep it running with auth & firestore
    const importFrom = `gs://${ciBucketName}/${latestAnonDbDir}`;
    await importFirestoreEmulatorBackup(importFrom, defaultEmulatorBackupPath);

    proc = await firebaseEmulatorExec({
      emulators: 'firestore',
      importPath: defaultEmulatorBackupPath,
      exportData: true,
    });

    // STEP 2 shrink DB
    const db = connectFirestoreEmulator();
    await startMaintenance(db);
    const status = await shrinkDb(db);
    await endMaintenance(db, EIGHT_MINUTES_IN_MS);

    // STEP 3 shutdown emulator & export db
    await shutdownEmulator(proc, defaultEmulatorBackupPath);

    if (status) {
      console.log(`Shrink ended ! Waiting for emulator to stop and upload of shrinked db to ${latestAnonShrinkedDbDir}`);
      // STEP 4 upload to backup bucket
      await uploadBackup({ localRelPath: getFirestoreExportPath(defaultEmulatorBackupPath), remoteDir: latestAnonShrinkedDbDir });

      console.log(`Upload to gs://${backupBucket}/${latestAnonShrinkedDbDir} complete !`);
      console.log(`If you want to test it, run : npm run backend-ops importEmulator gs://${backupBucket}/${latestAnonShrinkedDbDir}`);

      /**
       * @dev to test on live firebase project, run:
       * 
       * npm run backend-ops startMaintenance
       * npm run backend-ops importFirestore LATEST-ANON-SHRINKED-DB
       * npm run backend-ops syncUsers
       * npm run backend-ops endMaintenance
       */

    } else {
      console.log(`Something went wrong ! Skipped uploading of shrinked db to ${latestAnonShrinkedDbDir}`);
    }

  } catch (e) {
    await shutdownEmulator(proc);
    throw e;
  }
}

export async function shrinkDb(db: FirebaseFirestore.Firestore) {

  const { dbData, collectionData } = await loadAllCollections(db);

  // Data consistency check before cleaning data
  await printDatabaseInconsistencies({ dbData, collectionData }, undefined, { verbose: false });

  //////////////////
  // CHECK WHAT CAN BE DELETED
  // We want to keep only the users and orgs related to movies, contracts, events and the ones used in e2e tests (staticUsers) along with the documents in others collections they are linked to
  //////////////////

  const { usersToKeep, orgsToKeep } = getOrgsAndUsersToKeep(dbData);
  console.log('Users to keep :', usersToKeep.length);
  console.log('Orgs to keep :', orgsToKeep.length);

  //////////////////
  // FILTER DOCUMENT TO DELETE
  //////////////////

  const { usedDocuments, documentsToDelete } = getDocumentsToKeepOrDelete(dbData, collectionData, usersToKeep, orgsToKeep);
  console.log('Overall documents to keep :', usedDocuments.length);
  console.log('Documents that can be deleted :', documentsToDelete.length);

  //////////////////
  // ACTUAL DELETION
  //////////////////

  for (const document of documentsToDelete) {
    const doc = dbData[document.collection].refs.docs.find(d => d.id === document.docId);
    await doc.ref.delete();

    const batch = db.batch();
    await removeAllSubcollections(doc, batch, db, { verbose: false });
    await batch.commit();
  }

  //////////////////
  // DELETION SUMMARY
  //////////////////

  for (const collection of collectionData) {
    const docs = documentsToDelete.filter(d => d.collection === collection.name);
    console.log(`Deleted ${docs.length} ${collection.name} documents.`);
  }

  //////////////////
  // CLEANING OF REMAINING DOCUMENTS
  //////////////////

  const remainingOrgs = await db.collection('orgs').get();
  for (const _org of remainingOrgs.docs) {
    const org = _org.data() as OrganizationDocument;
    org.userIds = org.userIds.filter(uid => usersToKeep.includes(uid));
    await _org.ref.set(org);
  }

  console.log(`Cleaned ${remainingOrgs.docs.length} remaining orgs`);

  const remainingPermissions = await db.collection('permissions').get();
  for (const _perm of remainingPermissions.docs) {
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

  console.log(`Cleaned ${remainingPermissions.docs.length} permissions`);

  //////////////////
  // CHECK IF PROCESS WENT WELL
  //////////////////

  let errors = false;
  const remainingUsers = await db.collection('users').get();
  if (usersToKeep.length !== remainingUsers.docs.length) {
    console.log(`Remaining users VS calculated : ${remainingUsers.docs.length} / ${usersToKeep.length}`);
    errors = true;
  }

  if (orgsToKeep.length !== remainingOrgs.docs.length) {
    console.log(`Remaining orgs VS calculated : ${remainingOrgs.docs.length} / ${orgsToKeep.length}`);
    errors = true;
  }

  const remainingDocumentCount = await getAllDocumentCount(db);
  if (remainingDocumentCount !== usedDocuments.length) {
    console.log(`Remaining overall document count VS calculated : ${remainingDocumentCount} / ${usedDocuments.length}`);
    errors = true;
  }

  //////////////////
  // CLEANING REMAINING DOCUMENTS
  //////////////////

  console.log('Cleaning remaining documents');
  await cleanDeprecatedData(db, undefined, { verbose: false });

  return !errors;
}

function getOrgsAndUsersToKeep(dbData: DatabaseData) {
  const e2eUsers = Object.values(staticUsers).concat(USERS);
  const _usersLinked: string[] = e2eUsers;
  const _orgsLinked: string[] = [];

  for (const movie of dbData.movies.documents) {
    if (movie._meta.createdBy) {
      _usersLinked.push(movie._meta.createdBy);
    }

    if (movie._meta.updatedBy) {
      _usersLinked.push(movie._meta.updatedBy);
    }

    if (movie._meta.deletedBy) {
      _usersLinked.push(movie._meta.deletedBy);
    }

    for (const orgId of movie.orgIds) {
      _orgsLinked.push(orgId);
    }
  }

  for (const contract of dbData.contracts.documents) {
    if (contract.buyerUserId) {
      _usersLinked.push(contract.buyerUserId);
    }

    if (contract.buyerId) {
      _orgsLinked.push(contract.buyerId);
    }

    if (contract.sellerId) {
      _orgsLinked.push(contract.sellerId);
    }

    if (contract.stakeholders) {
      for (const orgId of contract.stakeholders) {
        _orgsLinked.push(orgId);
      }
    }
  }

  for (const event of dbData.events.documents) {
    _orgsLinked.push(event.ownerOrgId);

    if (event.meta?.organizerUid) {
      _usersLinked.push(event.meta.organizerUid);
    }
  }

  const getOrgSuperAdmin = (orgId: string) => {
    const permission = dbData.permissions.documents.find(p => p.id === orgId);
    return Object.keys(permission.roles).find(userId => permission.roles[userId] === 'superAdmin')
  }

  function getOrgIdOfUser(userId: string) {
    const org = dbData.orgs.documents.find(o => o.userIds.includes(userId));
    return org?.id || undefined;
  }

  const usersLinked = uniqueArray(_usersLinked).concat(uniqueArray(_orgsLinked).map(orgId => getOrgSuperAdmin(orgId)).filter(u => u));
  const usersToKeep: string[] = uniqueArray(usersLinked).filter(uid => dbData.users.refs.docs.find(d => d.id === uid));

  const orgsLinked = uniqueArray(_orgsLinked).concat(uniqueArray(_usersLinked).map(userId => getOrgIdOfUser(userId)).filter(o => o));
  const orgsToKeep: string[] = uniqueArray(orgsLinked).filter(id => dbData.orgs.refs.docs.find(d => d.id === id));

  return { usersToKeep, orgsToKeep };
}

function getDocumentsToKeepOrDelete(dbData: DatabaseData, collectionData: CollectionData[], usersToKeep: string[], orgsToKeep: string[]) {
  const usersDocumentsToKeep: DocumentDescriptor[] = dbData.users.refs.docs.filter(d => usersToKeep.includes(d.id)).map(d => ({
    collection: 'users',
    docId: d.id,
  }));

  const orgsDocumentsToKeep: DocumentDescriptor[] = dbData.orgs.refs.docs.filter(d => orgsToKeep.includes(d.id)).map(d => ({
    collection: 'orgs',
    docId: d.id
  }));

  const _usedDocumentsForUsers = usersToKeep.map(uid => {
    const user = dbData.users.refs.docs.find(d => d.id === uid);
    return inspectDocumentRelations(user, collectionData.filter(c => c.name !== 'orgs'), 'users');
  }).reduce((a: DocumentDescriptor[], b: DocumentDescriptor[]) => a.concat(b), []);

  const _usedDocumentsForOrgs = orgsToKeep.map(id => {
    const org = dbData.orgs.refs.docs.find(d => d.id === id);
    return inspectDocumentRelations(org, collectionData.filter(c => c.name !== 'users'), 'orgs');
  }).reduce((a: DocumentDescriptor[], b: DocumentDescriptor[]) => a.concat(b), []);

  const usedDocuments: DocumentDescriptor[] = _usedDocumentsForUsers
    .concat(_usedDocumentsForOrgs)
    .concat(usersDocumentsToKeep)
    .concat(orgsDocumentsToKeep)
    .filter((curr, index, self) => index === self.findIndex(t => t.collection === curr.collection && t.docId === curr.docId));

  const documentsToDelete: DocumentDescriptor[] = [];
  for (const collection of collectionData) {
    for (const document of collection.refs.docs) {
      const docId = document.id;
      if (!usedDocuments.find(u => u.collection === collection.name && u.docId === docId)) {
        documentsToDelete.push({ collection: collection.name, docId });
      }
    }
  }

  return { usedDocuments, documentsToDelete };
}

function uniqueArray(arr: string[]) {
  return Array.from(new Set(arr))
}

