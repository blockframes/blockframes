import {
  shutdownEmulator,
  importPrepareFirestoreEmulatorBackup,
  startFirestoreEmulatorWithImport,
  connectEmulator,
  defaultEmulatorBackupPath,
  runAnonymization,
  getLatestFolderURL,
  getServiceAccountObj,
  uploadDbBackupToBucket,
  loadAdminServices
} from '@blockframes/firebase-utils';
import { ChildProcess } from 'child_process';
import { resolve } from 'path';
import { backupBucket as prodBackupBucket, firebase as prodFirebase } from 'env/env.blockframes';
import admin from 'firebase-admin'
import { backupBucket } from '@env'

/**
 * This function will download the Firestore backup from specified bucket, import it into
 * the emulator and run the emulator without shutting it down. This command can be used to run
 * emulator in background while developing or running other processes.
 * @param bucketUrl GCS bucket URL for the Firestore backup
 */
export async function importEmulatorFromBucket(_bucketUrl: string) {
  const bucketUrl = _bucketUrl
    ? _bucketUrl
    : await getLatestFolderURL(loadAdminServices().storage.bucket(backupBucket));
  await importPrepareFirestoreEmulatorBackup(bucketUrl, defaultEmulatorBackupPath);
  let proc: ChildProcess;
  try {
    proc = await startFirestoreEmulatorWithImport(defaultEmulatorBackupPath);
    await new Promise(() => {});
  } catch (e) {
    await shutdownEmulator(proc);
    throw e;
  }
}

export interface StartEmulatorOptions {
  importFrom: 'defaultImport' | string
}

/**
 * This function will load the Firestore emulator from a default local path, or use the
 * path provided as an argument without downloading anything from a GCS bucket.
 * @param param0 this is a relative path to local Firestore backup to import into emulator
 */
export async function loadEmulator({ importFrom = 'defaultImport' }: StartEmulatorOptions) {
  const emulatorPath = importFrom === 'defaultImport' ? defaultEmulatorBackupPath : resolve(process.cwd(), importFrom);
  let proc: ChildProcess;
  try {
    proc = await startFirestoreEmulatorWithImport(emulatorPath);
    await new Promise(() => {});
  } catch (e) {
    await shutdownEmulator(proc)
    throw e;
  }
}

export async function anonymizeLatestProdDb() {
  if (!('FIREBASE_PRODUCTION_SERVICE_ACCOUNT' in process.env)) {
    throw new Error('Key "FIREBASE_PRODUCTION_SERVICE_ACCOUNT" does not exist in .env');
  }
  const cert = getServiceAccountObj(process.env.FIREBASE_PRODUCTION_SERVICE_ACCOUNT);

  const prodApp = admin.initializeApp(
    { storageBucket: prodBackupBucket,
      projectId: prodFirebase.projectId,
      credential: admin.credential.cert(cert),
    }, 'production');
  const prodStorage = prodApp.storage();
  console.log('Production projectId: ', prodFirebase.projectId);
  console.log('Production backup bucket name: ', prodBackupBucket);
  const prodBackupBucketObj = prodStorage.bucket(prodBackupBucket);
  const prodDbURL = await getLatestFolderURL(prodBackupBucketObj);
  console.log('Production Firestore Backup URL:', prodDbURL);
  await importPrepareFirestoreEmulatorBackup(prodDbURL, defaultEmulatorBackupPath);
  const proc = await startFirestoreEmulatorWithImport(defaultEmulatorBackupPath);
  try {
    const db = connectEmulator();
    const o = await db.listCollections();
    console.log(o.map((snap) => snap.id));
    await runAnonymization(db);
  } catch (e) {
    throw e;
  } finally {
    await shutdownEmulator(proc);
  }
}

export async function uploadBackup({ localRelPath, remoteDir }: { localRelPath?: string; remoteDir?: string; } = {}) {
  await uploadDbBackupToBucket({ bucketName: backupBucket, localPath: localRelPath, remoteDir });
}
