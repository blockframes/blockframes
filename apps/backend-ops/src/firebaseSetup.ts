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
import { copyDbFromCi, readJsonlFile, restoreStorageFromCi} from '@blockframes/firebase-utils';
import { firebase } from '@env';
export const { storageBucket } = firebase;

export async function prepareForTesting() {
  const { db, auth, storage, ci } = loadAdminServices();
  console.log('Fetching DB from blockframes-ci and uploading to local env...');
  const dbBackupPath = await copyDbFromCi(storage, ci);
  if (!dbBackupPath)
    throw Error('There was an error while downloading DB from blockframes-ci bucket...');
  console.log('DB copied to local bucket!');

  console.info(`Syncing users from : ${dbBackupPath} ...`);
  await syncUsers(readJsonlFile(dbBackupPath));
  console.info('Users synced!');

  console.info('Restoring backup...');
  await restore(appUrl.content);
  console.info('Backup restored!');

  console.info('Syncing storage...');
  await restoreStorageFromCi(ci);
  console.info('Storage synced!');

  console.info('Preparing the database...');
  await migrate(false); // run the migration, do not trigger a backup before, since we already have it!
  console.info('Database ready for testing!');

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

  process.exit(0);
}

/**
 * This is an experimental function to see if we can speed this process up
 */
export async function prepareInParallel() {
  const { db, auth, storage, ci } = loadAdminServices();

  const p1 = copyDbFromCi(storage, ci)
  const p2 = p1.then(dbPath => syncUsers(readJsonlFile(dbPath)))
  const p3 = p1.then(() => restore(appUrl.content))
  const p4 = p3.then(() => migrate(false))
  const p5 = p4.then(() => cleanDeprecatedData(db, auth))
  const p6 = restoreStorageFromCi(ci)
  const p7 = p6.then(() => cleanStorage(storage.bucket(storageBucket)))
  const p8 = p5.then(upgradeAlgoliaOrgs).then(upgradeAlgoliaMovies).then(upgradeAlgoliaUsers)
  const p9 = Promise.all([p5, p7]).then(generateWatermarks)

  return Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9])
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
