/**
 * Exposes imports and types to access the firebase / firestore / gcloud admin tools.
 *
 * Helper to avoid duplicating all the "semi-broken" google type defs.
 */
import request from 'request';
import { isInMaintenance, sleep } from '@blockframes/firebase-utils';

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
  if (process.env['ADMIN_PASSWORD'] === undefined) {
    throw new Error('no ADMIN_PASSWORD in your env, we need this to trigger backups / restores');
  }

  const url = getRestoreURL(appURL);
  const form = {
    password: process.env['ADMIN_PASSWORD']
  };

  // promisified request
  return new Promise((resolve, reject) => {
    request.post({ url, form }, async (error, response) => {
      if (error) {
        reject(error);
      } else if (response.statusCode < 200 || response.statusCode > 299) {
        /**
         * @dev this is a hack to handle unattended responses from 
         * express server (502). The nginx proxy on google sides seems to hang
         * up after a few seconds. To be sure that the restore is ended,
         * we wait for 500 seconds.
         */
        if (response.statusCode === 502) {
          const attempts = 10;
          for (let i = 0; i < attempts; i++) {
            const maintenance = await isInMaintenance(120 * 1000); // 2 minutes delay
            if (!maintenance) {
              console.log('Process ended!');
              resolve(response);
              continue;
            } else {
              console.log('Waiting for the process to end ...');
              await sleep(1000 * 50);
            }
          }
          reject('restore was still running after 10 attempts.');
        } else {
          reject(`invalid status code on restore: ${response.statusCode}. Check your firebase functions logs (admin function)`);
        }
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
  if (process.env['ADMIN_PASSWORD'] === undefined) {
    throw new Error('no ADMIN_PASSWORD in your env, we need this to trigger backups / restores');
  }

  const url = getBackupURL(appURL);
  const form = {
    password: process.env['ADMIN_PASSWORD']
  };

  // promisified request
  return new Promise((resolve, reject) => {
    request.post({ url, form }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

