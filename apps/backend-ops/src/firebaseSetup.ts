/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { syncUsers, generateWatermarks } from './users';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { migrate, migrateBeta } from './migrations';
import { importFirestore, restore } from './admin';
import { copyFirestoreExportFromCiBucket, getBackupBucket, latestAnonDbDir, latestAnonDbFilename, loadAdminServices, runShellCommand } from "@blockframes/firebase-utils";
import { cleanDeprecatedData } from './db-cleaning';
import { cleanStorage } from './storage-cleaning';
import { copyAnonDbFromCi, readJsonlFile, restoreStorageFromCi } from '@blockframes/firebase-utils';
import { firebase } from '@env';
import { generateFixtures } from './generate-fixtures';
import { ensureMaintenanceMode } from './tools';
const { storageBucket } = firebase();

export async function prepareForTesting() {
  const { db, auth, storage, getCI } = loadAdminServices();

  console.log('Fetching anonymized DB from blockframes-ci and uploading to local storage bucket...');
  const dbBackupPath = await copyAnonDbFromCi(storage, getCI());
  if (!dbBackupPath) throw Error('Unable to download Firestore backup from blockframes-ci bucket')
  console.log('DB copied to local bucket!');

  console.info(`Syncing users from : ${dbBackupPath} ...`);
  await syncUsers(readJsonlFile(dbBackupPath));
  console.info('Users synced!');

  console.info('DB backup in local storage bucket is being restored into Firestore...');
  await restore(latestAnonDbFilename);
  console.info('Backup restored!');

  console.info('Syncing storage with production backup stored in blockframes-ci...');
  await restoreStorageFromCi(getCI());
  console.info('Storage synced!');

  console.info('Preparing database & storage by running migrations...');
  await migrate(false); // run the migration, do not trigger a backup before, since we already have it!
  console.info('Migrations complete!');

  console.info('Cleaning unused DB data...');
  await cleanDeprecatedData(db, auth);
  console.info('DB data clean and fresh!');

  console.info('Cleaning unused storage data...');
  await cleanStorage(storage.bucket(storageBucket));
  console.info('Storage data clean and fresh!');

  console.info('Generating fixtures...')
  await generateFixtures()
  console.info('Fixtures generated in: tools/fixtures/*.json')

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  await upgradeAlgoliaUsers();
  console.info('Algolia ready for testing!');

  console.info('Generating watermarks...');
  await generateWatermarks();
  console.info('Watermarks generated!');

}

export async function prepareForTestingBeta() {
  const { storage, getCI, db, auth } = loadAdminServices();
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

  console.info('Syncing storage with production backup stored in blockframes-ci...');
  await restoreStorageFromCi(getCI());
  console.info('Storage synced!');

  console.info('Preparing database & storage by running migrations...');
  await migrateBeta({ db, storage, withBackup: false });
  console.info('Migrations complete!');

  console.info('Cleaning unused storage data...');
  await cleanStorage(await getBackupBucket(storage));
  console.info('Storage data clean and fresh!');

  console.info('Generating fixtures...');
  await generateFixtures();
  console.info('Fixtures generated in: tools/fixtures/*.json');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  await upgradeAlgoliaUsers();
  console.info('Algolia ready for testing!');

  console.info('Generating watermarks...');
  await generateWatermarks();
  console.info('Watermarks generated!');

  insurance(); // Switch off maintenance insurance
}

export async function prepareDb() {
  console.warn('This script only restores the DB - does NOT refresh Firebase Auth, Sync storage, generate fixtures.');
  console.warn('Nor does this script check for a new/updated anonymized db from the ci environment - latest from storage backup used');
  console.log('Restoring latest db from storage...')
  await importFirestore(latestAnonDbDir);
  console.log('Anonymized DB restored. Migrating...');
  await migrateBeta({ withBackup: false });
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
  await migrate(true);
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
  await generateWatermarks();
  console.info('Watermarks generated!');
}

export async function upgradeBeta() {
  const { db, auth, storage } = loadAdminServices();

  console.info('Preparing the database...');
  await migrateBeta({ withBackup: true, db, storage });
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
