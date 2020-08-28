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
import { copyDbFromCi, readJsonlFile, checkEnv } from '@blockframes/firebase-utils';
import { firebase } from '@env';
export const { storageBucket } = firebase;

export async function prepareForTesting() {
  const msg =
    'You do not have your service accounts correctly configured. Please see: https://www.notion.so/cascade8/Preparing-your-Environment-e3c184db24d447c496c3241d4f16bc94';
  checkEnv(
    [
      ['GOOGLE_APPLICATION_CREDENTIALS', msg],
      ['FIREBASE_CI_SERVICE_ACCOUNT', msg],
    ],
    { throwError: true }
  );
  console.log('Fetching DB from blockframes-ci and uploading to local env...');
  const dbBackupPath = await copyDbFromCi();

  if (dbBackupPath !== null) {
    console.log('DB copied to local bucket!');

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
  } else {
    console.log('There was an error while downloading DB from blockframes-ci bucket...');
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
