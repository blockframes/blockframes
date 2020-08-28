/**
 * Exposes imports and types to access the firebase / firestore / gcloud admin tools.
 *
 * Helper to avoid duplicating all the "semi-broken" google type defs.
 */
import * as admin from 'firebase-admin';
import { firebase } from '@env';
import request from 'request';
import { isInMaintenance } from '@blockframes/firebase-utils';
import { sleep } from './tools';
import { firebase as firebaseCI } from 'env/env.ci';

export type Auth = admin.auth.Auth;
export type Firestore = admin.firestore.Firestore;
export type Storage = admin.storage.Storage;
export type DocumentReference = admin.firestore.DocumentReference;
export type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;
export type QuerySnapshot = admin.firestore.QuerySnapshot;
export type Transaction = admin.firestore.Transaction;
export type UserRecord = admin.auth.UserRecord;

export interface AdminServices {
  auth: Auth;
  db: Firestore;
  storage: Storage;
  firebaseConfig: { projectId: string };
  ci: admin.app.App
}

let app: admin.app.App;
let ci: admin.app.App;

export function loadAdminServices(): AdminServices {
  if (!('FIREBASE_CI_SERVICE_ACCOUNT' in process.env)) {
    throw new Error('Key "FIREBASE_CI_SERVICE_ACCOUNT" does not exist in .env');
  }

  type Cert = string | admin.ServiceAccount;
  let cert: Cert;
  try {
    // If service account is a stringified json object
    cert = JSON.parse(process.env.FIREBASE_CI_SERVICE_ACCOUNT as string);
  } catch (err) {
    // If service account is a path
    cert = process.env.FIREBASE_CI_SERVICE_ACCOUNT as admin.ServiceAccount;
  }

  if (!app) {
    app = admin.initializeApp({
      ...firebase,
      credential: admin.credential.applicationDefault(),
    }, 'local');
  }
  if (!ci) {
    ci = admin.initializeApp(
      {
        projectId: firebaseCI.projectId,
        credential: admin.credential.cert(cert),
      },
      'CI-app'
    );
  }

  return {ci,  auth: app.auth(), db: app.firestore(), firebaseConfig: firebase, storage: app.storage() };
}

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

