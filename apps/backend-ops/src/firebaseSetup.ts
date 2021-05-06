/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { syncUsers, generateWatermarks } from './users';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { migrate } from './migrations';
import { importFirestore } from './admin';
import { copyFirestoreExportFromCiBucket, latestAnonDbDir, loadAdminServices, restoreAnonStorageFromCI } from "@blockframes/firebase-utils";
import { cleanDeprecatedData } from './db-cleaning';
import { cleanStorage } from './storage-cleaning';
import { restoreStorageFromCi } from '@blockframes/firebase-utils';
import { firebase } from '@env';
import { generateFixtures } from './generate-fixtures';
import { ensureMaintenanceMode } from './tools';
const { storageBucket } = firebase();

export async function prepareForTesting() {
  const { storage, db, auth } = loadAdminServices();
  const insurance = await ensureMaintenanceMode(db); // Enable maintenance insurance

  console.log('Copying AnonDb from CI...');
  await copyFirestoreExportFromCiBucket();
  console.log('Copied!');

  console.log('Clearing Firestore db and importing latest anonymized db...');
  await importFirestore(latestAnonDbDir);
  console.log('DB imported!');

  console.info('Syncing users from db...');
  await syncUsers(null, db, auth);
  console.info('Users synced!');

  console.info('Syncing storage with blockframes-ci...');
  await restoreAnonStorageFromCI();
  console.info('Storage synced!');

  console.info('Preparing database & storage by running migrations...');
  await migrate({ db, storage, withBackup: false });
  console.info('Migrations complete!');

  console.info('Generating fixtures...');
  await generateFixtures();
  console.info('Fixtures generated in: tools/fixtures/*.json');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  await upgradeAlgoliaUsers();
  console.info('Algolia ready for testing!');

  insurance(); // Switch off maintenance insurance
}

export async function prepareDb() {
  console.warn('This script only restores the DB - does NOT refresh Firebase Auth, Sync storage, generate fixtures.');
  console.warn('Nor does this script check for a new/updated anonymized db from the ci environment - latest from storage backup used');
  console.log('Restoring latest db from storage...')
  await importFirestore(latestAnonDbDir);
  console.log('Anonymized DB restored. Migrating...');
  await migrate({ withBackup: false });
}

export async function prepareStorage() {
  const { storage, getCI } = loadAdminServices();

  console.info('Syncing storage with production backup stored in blockframes-ci...');
  await restoreStorageFromCi(getCI());
  console.info('Storage synced!');

  console.info('Cleaning unused storage data...');
  await cleanStorage(storage.bucket(storageBucket));
  console.info('Storage data clean and fresh!');

  console.info('Generating watermarks...');
  await generateWatermarks();
  console.info('Watermarks generated!');
}

export async function upgrade() {
  const { db, auth, storage } = loadAdminServices();

  console.info('Preparing the database...');
  await migrate({ withBackup: true, db, storage });
  console.info('Database ready for deploy!');

  console.info('Cleaning unused db data...');
  await cleanDeprecatedData(db, auth);
  console.info('DB data clean and fresh!');

  console.info('Cleaning unused storage data...');
  await cleanStorage(storage.bucket(storageBucket));
  console.info('Storage data clean and fresh!');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  await upgradeAlgoliaUsers();
  console.info('Algolia ready for testing!');

  console.info('Generating watermarks...');
  await generateWatermarks({ db, storage });
  console.info('Watermarks generated!');
}
