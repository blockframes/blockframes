import admin, { storage } from "firebase-admin";
import { backupBucket, firebase } from '@env'
import { execSync } from "child_process";
import { enableMaintenanceInEmulator } from "./emulator";
import camelcase from 'camelcase'
import { clearDbCLI, defaultEmulatorBackupPath, getLatestDirName, importFirestoreEmulatorBackup, loadAdminServices, uploadDbBackupToBucket } from "@blockframes/firebase-utils";
import { deleteAllUsers } from "@blockframes/testing/firebase";
import { ensureMaintenanceMode } from "./tools";
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from "./algolia";

export const getFirebaseBackupDirname = (d: Date) => `firebase-backup-${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`

export async function backupEnv() {
  const backupDir = getFirebaseBackupDirname(new Date());
  const backupURL = `gs://${backupBucket}/${backupDir}`;

  const firestoreURL = `${backupURL}/firestore`;
  const storageURL = `${backupURL}/storage`;
  const authURL = `${backupURL}`;

  let cmd: string;

  console.log(`backing up Firestore to ${firestoreURL}`);
  cmd = `gcloud firestore export --project ${firebase().projectId} ${firestoreURL}`;
  console.log('Running cmd:', cmd);
  let output = execSync(cmd).toString();
  console.log(output);

  console.log(`backing up storage to ${storageURL}`);
  cmd = `gsutil -m cp -r "gs://${firebase().storageBucket}/*" "${storageURL}"`;
  console.log('Running cmd:', cmd);
  output = execSync(cmd).toString();
  console.log(output);

  console.log(`backing up auth to ${authURL}`);
  cmd = `firebase auth:export -P ${firebase().projectId} ./tmp/auth-backup.json`;
  console.log('Running cmd:', cmd);
  output = execSync(cmd).toString();
  console.log(output);

  cmd = `gsutil -m cp "./tmp/auth-backup.json" "${authURL}"`
  console.log('Running cmd:', cmd);
  output = execSync(cmd).toString();
  console.log(output);

  console.log('Firebase backup done!');
}

export async function restoreEnv(dirName?: string) {
  console.log( 'When restoring an entire env, this function will check your local environment vars for AUTH_KEY');
  console.log( 'If not found, it will manually restore auth with a default password. Otherwise it will restore original auth backup');
  const { storage, db, auth } = loadAdminServices();
  const bucket = storage.bucket(backupBucket);
  const backupDir = dirName || await getLatestDirName(bucket, 'firebase');

  const backupURL = `gs://${backupBucket}/${backupDir}`;

  const firestoreURL = `${backupURL}/firestore`;
  const storageURL = `${backupURL}/storage`;
  const authURL = `${backupURL}/auth-backup.json`;

  let cmd: string;
  let output: string;

  console.log('Clearing existing env!')

  console.log('Ensuring maintenance mode stays enabled')
  const maintenanceInsurance = await ensureMaintenanceMode(db)
  console.log('Clearing Firestore...')

  await clearDbCLI(db);

  console.log('Clearing storage,,,');
  cmd = `gsutil -m rm -r "${backupBucket}/*"`;
  output = execSync(cmd).toString();
  console.log(output);

  console.log('Clearing auth...');
  await deleteAllUsers(auth);

  console.log('Old env data is now cleared')

  console.log('Enabling maintenance in backup...')
  await importFirestoreEmulatorBackup(firestoreURL, defaultEmulatorBackupPath);
  await enableMaintenanceInEmulator({importFrom: 'defaultImport'})
  await uploadDbBackupToBucket({bucketName: backupBucket, remoteDir: `${backupDir}/firestore`})

  console.log('Importing Firestore');
  cmd = `gcloud firestore import ${firestoreURL}`;
  output = execSync(cmd).toString();
  console.log(output);

  console.log('Importing storage');
  cmd = `gsutil -m cp -r "${storageURL}/*" "gs://${firebase().storageBucket}"`;
  output = execSync(cmd).toString();
  console.log(output);

  console.log('Importing auth');
  cmd = `gsutil cp "${authURL}" ./tmp/`
  output = execSync(cmd).toString()
  console.log(output);

  cmd = `firebase auth:import --hash-algo SCRYPT --hash-key ${process.env.AUTH_KEY} --mem-cost 14 --rounds 8 --salt-separator Bw==`;
  output = execSync(cmd).toString()
  console.log(output);

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  await upgradeAlgoliaUsers();
  console.info('Algolia ready!');

  maintenanceInsurance()
}
