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
import { generateUserFixtures } from './user-fixture';
import { cleanDeprecatedData } from './db-cleaning';
import { cleanStorage } from './storage-cleaning';
import { syncStorage } from './syncStorage';

export async function prepareForTesting() {
  console.info('Restoring backup...');
  await restore(appUrl.content);
  console.info('Backup restored!');

  console.info('Generating fixtures file...');
  await generateUserFixtures();
  console.info('fixtures file done!');

  console.info('Syncing users...');
  await syncUsers();
  console.info('Users synced!');

  console.info('Preparing the database...');
  await migrate(false); // run the migration, do not trigger a backup before, since we already have it!
  console.info('Database ready for testing!');

  // @todo(#3066) Reactivate Cleaning process when unit tested
  // console.info('Cleaning unused data...')
  // await cleanDeprecatedData();
  // await cleanStorage();
  // console.info('Data clean and fresh!')

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  await upgradeAlgoliaUsers();
  console.info('Algolia ready for testing!');

  console.info('Generating watermarks...');
  await generateWatermarks();
  console.info('Watermarks generated!');

  console.info('Syncing firestore with storage');
  await syncStorage();
  console.info('Firestore is now synced with storage!');

  process.exit(0);
}

export async function restoreShortcut() {
  return restore(appUrl.content);
}

export async function upgrade() {
  console.info('Preparing the database...');
  await migrate(true);
  console.info('Database ready for deploy!');

  // @todo(#3066) Reactivate Cleaning process when unit tested
  // console.info('Cleaning unused data...')
  // await cleanDeprecatedData();
  // await cleanStorage();
  // console.info('Data clean and fresh!')

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
