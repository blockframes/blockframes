/**
 * Tooling to setup the firebase project before running tests.
 *
 * This module provides functions to trigger a firestore restore and test user creations.
 */
import request from 'request';
import { appUrl } from '@env';
import { syncUsers } from './users';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs } from './algolia';
import { migrate } from './migrations';

function getRestoreURL(appURL: string): string {
  return `${appURL}/admin/data/restore`;
}

function getBackupURL(appURL: string): string {
  return `${appURL}/admin/data/backup`;
}

/**
 * Trigger a firestore database restore operation for the given project
 */
export async function restore(appURL: string) {
  const url = getRestoreURL(appURL);

  // promisified request
  return new Promise((resolve, reject) => {
    request.post(url, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Trigger a firestore database backup operation for the given project
 */
export async function backup(appURL: string) {
  const url = getBackupURL(appURL);

  // promisified request
  return new Promise((resolve, reject) => {
    request.post(url, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

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
