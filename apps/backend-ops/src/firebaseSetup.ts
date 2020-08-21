/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { appUrl } from '@env';
import { syncUsers, generateWatermarks } from './users';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { migrate } from './migrations';
import { restore, loadAdminServices } from './admin';
import { cleanDeprecatedData } from './db-cleaning';
import { cleanStorage } from './storage-cleaning';
import { syncStorage } from './syncStorage';
import { copyDbFromCi, readJsonlFile } from '@blockframes/firebase-utils';
import { firebase } from '@env';
export const { storageBucket } = firebase;

export async function prepareForTesting() {
  console.log('Fetching DB from blockframes-ci and uploading to local env...');
  const dbBackupPath = await copyDbFromCi();
  console.log('DB copied to local bucket!');

  if (dbBackupPath !== null) {
    console.info(`Syncing users from : ${dbBackupPath} ...`);
    await syncUsers(readJsonlFile(dbBackupPath));
    console.info('Users synced!');

    console.info('Restoring backup...');
    await restore(appUrl.content);
    console.info('Backup restored!');

    console.info('Preparing the database...');
    await migrate(false); // run the migration, do not trigger a backup before, since we already have it!
    console.info('Database ready for testing!');

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

    // console.info('Syncing firestore with storage');
    // await syncStorage();
    // console.info('Firestore is now synced with storage!');
  }

  process.exit(0);
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
