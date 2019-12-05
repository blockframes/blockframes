/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import { appUrl } from '@env';
import { syncUsers } from './users';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs } from './algolia';
import { migrate } from './migrations';
import { restore } from './admin';

export async function prepareForTesting() {
  console.info('Syncing users...');
  await syncUsers();
  console.info('Users synced!');

  console.info('Restoring backup...');
  await restore(appUrl);
  console.info('backup restored!');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  console.info('Algolia ready for testing!');

  console.info('Preparing the database...');
  await migrate(false); // run the migration, do not trigger a backup before, since we already have it!
  console.info('database ready for testing...');

  process.exit(0);
}
