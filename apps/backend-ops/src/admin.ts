/**
 * Exposes imports and types to access the firebase / firestore / gcloud admin tools.
 *
 * Helper to avoid duplicating all the "semi-broken" google type defs.
 */
import * as admin from 'firebase-admin';
import { firebase } from '@env';
import request from 'request';

export type Auth = admin.auth.Auth;
export type Firestore = admin.firestore.Firestore;
export type DocumentReference = admin.firestore.DocumentReference;
export type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;
export type QuerySnapshot = admin.firestore.QuerySnapshot;
export type Transaction = admin.firestore.Transaction;
export type UserRecord = admin.auth.UserRecord;

export interface AdminServices {
  auth: Auth;
  db: Firestore;
  firebaseConfig: { projectId: string };
}

export function loadAdminServices(): AdminServices {
  if (!admin.apps.length) {
    admin.initializeApp({
      ...firebase,
      credential: admin.credential.applicationDefault(),
    });
  }

  return { auth: admin.auth(), db: admin.firestore(), firebaseConfig: firebase };
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
    request.post({ url, form }, (error, response) => {
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

