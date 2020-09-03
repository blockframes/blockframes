import * as admin from 'firebase-admin';
import { firebase } from '@env';
import { firebase as firebaseCI } from 'env/env.ci';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import requiredVars from 'tools/mandatory-env-vars.json';

export interface JsonlDbRecord {
  docPath: string;
  content: { [key: string]: any };
}

export function readJsonlFile(dbBackupPath: string) {
  const file = readFileSync(dbBackupPath, 'utf-8');
  return file
    .split('\n')
    .filter((str) => !!str) // remove last line
    .map((str) => JSON.parse(str) as JsonlDbRecord);
}

export function warnMissingVars(): void | never {
  const warn = (key: string, msg: string) => {
    console.warn(`Please ensure the following variable is set in .env : ${key}`);
    console.warn(`More info: ${msg}\n`);
  };
  requiredVars.map(
    ({ key, msg }: { key: string; msg: string }) => process.env?.[key] ?? warn(key, msg)
  );
}

export function catchErrors<T>(fn: (...args: any[]) => T): T | undefined {
  try {
    return fn();
  } catch (err) {
    if ('errors' in err) {
      err.errors.forEach((error: any) => console.error('ERROR:', error.message));
    } else {
      console.error(err);
    }
    return;
  }
}

export interface AdminServices {
  auth: admin.auth.Auth;
  db: admin.firestore.Firestore;
  storage: admin.storage.Storage;
  firebaseConfig: { projectId: string };
  getCI: () => admin.app.App;
}

let ci: admin.app.App;

export function loadAdminServices(): AdminServices {
  config();
  warnMissingVars();

  let cert: string | admin.ServiceAccount;
  try {
    // If service account is a stringified json object
    cert = JSON.parse(process.env.FIREBASE_CI_SERVICE_ACCOUNT as string);
  } catch (err) {
    // If service account is a path
    cert = process.env.FIREBASE_CI_SERVICE_ACCOUNT as admin.ServiceAccount;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      ...firebase,
      credential: admin.credential.applicationDefault(),
    });
  }

  const getCI = () => {
    if (!ci) {
      ci = admin.initializeApp(
        {
          projectId: firebaseCI.projectId,
          credential: admin.credential.cert(cert),
        },
        'CI-app'
      );
    }
    return ci;
  };

  return {
    getCI,
    auth: admin.auth(),
    db: admin.firestore(),
    firebaseConfig: firebase,
    storage: admin.storage(),
  };
}
