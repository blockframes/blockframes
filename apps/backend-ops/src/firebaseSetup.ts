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
import { copyDbFromCi, readJsonlFile, restoreStorageFromCi, warnMissingVars} from '@blockframes/firebase-utils';
import { firebase } from '@env';
import { generateFixtures } from './generate-fixtures';
export const { storageBucket } = firebase;

export async function prepareForTesting() {
  warnMissingVars()
  const { db, auth, storage, getCI } = loadAdminServices();
  console.log('Fetching DB from blockframes-ci and uploading to local env...');
  const dbBackupPath = await copyDbFromCi(storage, getCI());
  if (!dbBackupPath) throw Error('Unable to download Firestore backup from blockframes-ci bucket')
  console.log('DB copied to local bucket!');

  console.info(`Syncing users from : ${dbBackupPath} ...`);
  await syncUsers(readJsonlFile(dbBackupPath));
  console.info('Users synced!');

  console.info('Restoring backup...');
  await restore(appUrl.content);
  console.info('Backup restored!');

  console.info('Syncing storage...');
  await restoreStorageFromCi(getCI());
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

  process.exit(0);
}

/**
 * This is an experimental function to see if we can speed this process up
 */
export async function prepareInParallel() {
  const { db, auth, storage, getCI } = loadAdminServices();

  const p1 = copyDbFromCi(storage, getCI())
  const p2 = p1.then(dbPath => syncUsers(readJsonlFile(dbPath)))
  const p3 = p1.then(() => restore(appUrl.content))
  const p4 = p3.then(() => migrate(false))
  const p5 = p4.then(() => cleanDeprecatedData(db, auth))
  const p6 = restoreStorageFromCi(getCI())
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
