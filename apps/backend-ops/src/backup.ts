import admin, { storage } from "firebase-admin";
import { backupBucket, firebase } from '@env'
import { execSync } from "child_process";
import { switchOnMaintenance } from "./emulator";

export const getFirebaseBackupDirname = (d: Date) => `firebase-backup-${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`

export async function backupEnv() {
  const backupDir = getFirebaseBackupDirname(new Date());
  const backupURL = `gs://${backupBucket}/${backupDir}`;

  const firebaseURL = `${backupURL}/firebase`;
  const storageURL = `${backupURL}/storage`;
  const authURL = `${backupURL}`;

  let cmd: string;

  console.log(`backing up Firestore to ${firebaseURL}`);
  cmd = `gcloud firestore export --project ${firebase().projectId} ${firebaseURL}`;
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

export async function restoreEnv() {

  // - switchOnMaintenance
  // - sync algolia
}
