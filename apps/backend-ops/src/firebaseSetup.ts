/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { appUrl } from '@env';
import { syncUsers, generateWatermarks } from './users';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { migrate } from './migrations';
import { restore } from './admin';
import { loadAdminServices } from "@blockframes/firebase-utils";
import { cleanDeprecatedData } from './db-cleaning';
import { cleanStorage } from './storage-cleaning';
// import { syncStorage } from './syncStorage';
import { copyDbFromCi, readJsonlFile, restoreStorageFromCi, warnMissingVars} from '@blockframes/firebase-utils';
import { firebase } from '@env';
import { generateFixtures } from './generate-fixtures';
export const { storageBucket } = firebase;

export async function prepareForTesting() {
  warnMissingVars()
  const { db, auth, storage, getCI } = loadAdminServices();
  console.log('Fetching anonymized DB from blockframes-ci and uploading to local storage bucket...');
  const dbBackupPath = await copyDbFromCi(storage, getCI());
  if (!dbBackupPath) throw Error('Unable to download Firestore backup from blockframes-ci bucket')
  console.log('DB copied to local bucket!');

  console.info(`Syncing users from : ${dbBackupPath} ...`);
  await syncUsers(readJsonlFile(dbBackupPath));
  console.info('Users synced!');

  console.info('DB backup in local storage bucket is being restored into Firestore...');
  await restore(appUrl.content);
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

  // console.info('Syncing firestore with storage');
  // await syncStorage();
  // console.info('Firestore is now synced with storage!');

  process.exit(0);
}

export async function prepareDb() {
  const { db, auth } = loadAdminServices();
  console.warn( 'This script only restores the DB - does NOT refresh Firebase Auth, Sync storage, generate fixtures.');
  console.warn( 'Nor does this script check for a new/updated anonymized db from the ci environment - latest from storage backup used');
  console.log('Restoring latest db from storage...')
  await restore(appUrl.content);
  console.log('Anonymized DB restored. Migrating...');
  await migrate(false);
  console.log('DB migration complete. Cleaning up...');
  await cleanDeprecatedData(db, auth);
  console.log('Deprecated data removed!');
}

export async function restoreShortcut() {
  return restore(appUrl.content);
}

export async function upgrade() {
  console.info('Preparing the database...');
  await migrate(true);
  console.info('Database ready for deploy!');

  const { db, auth, storage } = loadAdminServices();
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

  process.exit(0);
}
