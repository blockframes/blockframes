import { runChunks, startMaintenance } from '@blockframes/firebase-utils';
import {
  defaultEmulatorBackupPath,
  firebaseEmulatorExec,
  getFirestoreExportPath,
  importFirestoreEmulatorBackup,
  shutdownEmulator
} from './firebase-utils/firestore/emulator';
import { uploadBackup } from './emulator';
import { backupBucket, centralOrgId } from '@env';
import { CI_ANONYMIZED_DATA, latestAnonDbDir, latestAnonShrinkedDbDir } from './firebase-utils';
import type { ChildProcess } from 'child_process';
import {
  CollectionData,
  Collections,
  notMandatoryCollections,
  DatabaseData,
  DocumentDescriptor,
  getAllDocumentCount,
  inspectDocumentRelations,
  loadAllCollections,
  printDatabaseInconsistencies
} from './internals/utils';
import { cleanDeprecatedData } from './db-cleaning';
import { getFirestoreEmulator } from '@blockframes/firebase-utils/initialize';
import { unique } from '@blockframes/utils/helpers';
import {
  CmsPage,
  getAllAppsExcept,
  isMovieAccepted,
  Movie,
  OrgsSection,
  OrgTitlesSection,
  pdfExportLimit
} from '@blockframes/model';

export async function loadAndShrinkLatestAnonDbAndUpload() {
  let proc: ChildProcess;
  try {
    // STEP 1 load-latest anon-db into emulator and keep it running with auth & firestore
    const importFrom = `gs://${CI_ANONYMIZED_DATA}/${latestAnonDbDir}`;
    await importFirestoreEmulatorBackup(importFrom, defaultEmulatorBackupPath);

    proc = await firebaseEmulatorExec({
      emulators: 'firestore',
      importPath: defaultEmulatorBackupPath,
      exportData: true,
    });

    // STEP 2 shrink DB
    const db = getFirestoreEmulator();
    await startMaintenance(db);
    const status = await shrinkDb(db);

    // STEP 3 shutdown emulator & export db
    await shutdownEmulator(proc, defaultEmulatorBackupPath);

    if (status) {
      console.log(`Shrink ended ! Waiting for emulator to stop and upload of shrinked db to ${latestAnonShrinkedDbDir}`);
      // STEP 4 upload to backup bucket
      await uploadBackup({ localRelPath: getFirestoreExportPath(defaultEmulatorBackupPath), remoteDir: latestAnonShrinkedDbDir });

      console.log(`Upload to gs://${backupBucket}/${latestAnonShrinkedDbDir} complete !`);
      console.log('If you want to test it, run :');
      console.log(`npm run backend-ops importEmulator gs://${backupBucket}/${latestAnonShrinkedDbDir}`);
      console.log('npm run backend-ops endMaintenance');

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

  //////////////////
  // PRE CLEANING
  // Keeping only collections that will allow apps to run. ie : blockframesAdmin, cms, docsIndex, movies, orgs, permissions, users
  //////////////////

  console.log(`Cleaning not mandatory collections: ${notMandatoryCollections.join(', ')}.`);
  for (const collection of notMandatoryCollections) {
    await cleanCollection(db, collection).catch(_ => console.log(`Error while cleaning ${collection} collection.`));
    console.log(`Cleaned collection : ${collection}.`);
  }

  //////////////////
  // Shrinking Movies
  // We don't need all movies to perform E2E tests
  //////////////////

  console.log(`Shrinking movies collection to keep a minimum of ${pdfExportLimit} documents per application.`);
  await shrinkMovieCollection(db, pdfExportLimit).catch(_ => console.log('Error while shrinking movies collection.'));
  console.log('Movies collection shrinked.');

  const { dbData, collectionData } = await loadAllCollections(db);

  // Data consistency check before cleaning data
  await printDatabaseInconsistencies({ dbData, collectionData }, undefined, { printDetail: false });

  //////////////////
  // CHECK WHAT CAN BE DELETED
  // We want to keep only the users and orgs related to movies
  //////////////////

  const { usersToKeep, orgsToKeep } = getOrgsAndUsersToKeep(dbData);
  console.log('Users to keep :', usersToKeep.length);
  console.log('Orgs to keep :', orgsToKeep.length);

  //////////////////
  // CLEAN CMS COLLECTION
  // Remove missing orgIds and titleIds
  //////////////////

  await cleanCmsDocuments(db, dbData.movies.documents.map(d => d.id), orgsToKeep);
  console.log('Cleaned CMS collection.');

  //////////////////
  // FILTER DOCUMENT TO DELETE
  //////////////////

  const { usedDocuments, documentsToDelete } = getDocumentsToKeepOrDelete(dbData, collectionData, usersToKeep, orgsToKeep);
  console.log('Overall documents to keep :', usedDocuments.length);
  console.log('Documents that can be deleted :', documentsToDelete.length);

  //////////////////
  // ACTUAL DELETION
  //////////////////

  const docs = documentsToDelete.map(document => dbData[document.collection].refs.docs.find(d => d.id === document.docId));
  await removeDocuments(db, docs).catch(_ => console.log('Error while deleting remaining documents.'));

  //////////////////
  // DELETION SUMMARY
  //////////////////

  for (const collection of collectionData) {
    const docs = documentsToDelete.filter(d => d.collection === collection.name);
    console.log(`Deleted ${docs.length} ${collection.name} documents.`);
  }

  //////////////////
  // CHECK IF PROCESS WENT WELL
  //////////////////

  let errors = false;
  const remainingUsers = await db.collection('users').get();
  if (usersToKeep.length !== remainingUsers.docs.length) {
    console.log(`Remaining users VS calculated : ${remainingUsers.docs.length} / ${usersToKeep.length}`);
    errors = true;
  }

  const remainingOrgs = await db.collection('orgs').get();
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

/**
 * Removes all documents from a collection
 * @param db 
 * @param collection 
 * @param verbose 
 * @returns 
 */
async function cleanCollection(db: FirebaseFirestore.Firestore, collection: Collections) {
  const { docs: documents } = await db.collection(collection).get();
  return removeDocuments(db, documents);
}

/**
 * Shrinks movies collection by keeping only a given number of documents with status accepted
 * @param db 
 * @param collection 
 * @param keep 
 * @param verbose 
 * @returns 
 */
async function shrinkMovieCollection(db: FirebaseFirestore.Firestore, keep: number) {
  const { docs: allMovies } = await db.collection('movies').get();
  const movies = allMovies.map(m => m.data() as Movie);

  const apps = getAllAppsExcept(['crm']);
  let acceptedMovieIds: string[] = [];
  for (const app of apps) {
    acceptedMovieIds = acceptedMovieIds.concat(movies.filter(m => isMovieAccepted(m, app)).slice(0, keep).map(m => m.id));
  }

  const movieIdsToKeep = unique(acceptedMovieIds);
  const refsToDelete = allMovies.filter(doc => !movieIdsToKeep.find(id => id === doc.id));
  return removeDocuments(db, refsToDelete, 500);
}

async function removeDocuments(db: FirebaseFirestore.Firestore, docs: FirebaseFirestore.QueryDocumentSnapshot[], rowsConcurrency = 200) {
  const refsToDelete: FirebaseFirestore.DocumentReference[] = [];
  await runChunks(
    docs,
    async (doc) => {
      refsToDelete.push(doc.ref);
      const subCollections = await doc.ref.listCollections();
      for (const x of subCollections) {
        const documents = await db.collection(x.path).listDocuments();
        documents.forEach(ref => refsToDelete.push(ref));
      }
    }, rowsConcurrency, false
  );

  const chunkSize = 500; // Max items allowed in a batch
  for (let i = 0; i < refsToDelete.length; i += chunkSize) {
    const chunk = refsToDelete.slice(i, i + chunkSize);
    const batch = db.batch();
    chunk.forEach(ref => batch.delete(ref));
    await batch.commit();
  }
}

function getOrgsAndUsersToKeep(dbData: DatabaseData) {
  const _usersLinked: string[] = [];
  const _orgsLinked: string[] = Object.values(centralOrgId);

  for (const movie of dbData.movies.documents) {
    if (movie._meta.createdBy) {
      _usersLinked.push(movie._meta.createdBy);
    }

    if (movie._meta.updatedBy) {
      _usersLinked.push(movie._meta.updatedBy);
    }

    for (const orgId of movie.orgIds) {
      _orgsLinked.push(orgId);
    }
  }

  const getOrgSuperAdmin = (orgId: string) => {
    const permission = dbData.permissions.documents.find(p => p.id === orgId);
    return Object.keys(permission.roles).find(userId => permission.roles[userId] === 'superAdmin');
  }

  function getOrgIdOfUser(userId: string) {
    const org = dbData.orgs.documents.find(o => o.userIds.includes(userId));
    return org?.id || undefined;
  }

  const usersLinkedOrgIds: string[] = unique(_usersLinked).map(userId => getOrgIdOfUser(userId)).filter(o => o);
  const orgSuperAdmins = unique(_orgsLinked.filter(o => o).concat(usersLinkedOrgIds)).map(orgId => getOrgSuperAdmin(orgId)).filter(u => u);

  const usersLinked = unique(_usersLinked).concat(orgSuperAdmins);

  const usersToKeep = unique(usersLinked).filter(uid => dbData.users.refs.docs.find(d => d.id === uid));

  const orgsLinked = unique(_orgsLinked).concat(usersLinkedOrgIds);
  const orgsToKeep = unique(orgsLinked).filter(id => dbData.orgs.refs.docs.find(d => d.id === id));

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

async function cleanCmsDocuments(db: FirebaseFirestore.Firestore, titleIds: string[], orgIds: string[]) {
  const { docs: cmsDocs } = await db.collection('cms').get();
  for (const cmsDoc of cmsDocs) {
    const subCollections = await cmsDoc.ref.listCollections();
    for (const x of subCollections) {
      const { docs: documentRefs } = await db.collection(x.path).get();

      for (const snap of documentRefs) {
        const doc = snap.data() as CmsPage;
        for (const section of doc.sections) {
          if ((section as OrgTitlesSection).titleIds?.length) {
            (section as OrgTitlesSection).titleIds = (section as OrgTitlesSection).titleIds.filter(id => titleIds.includes(id));
          }
          if ((section as OrgsSection).orgIds?.length) {
            (section as OrgsSection).orgIds = (section as OrgsSection).orgIds.filter(id => orgIds.includes(id));
          }
        }
        await snap.ref.update({ ...doc });
      }
    }
  }
}
