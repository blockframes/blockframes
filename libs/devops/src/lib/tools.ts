import { Firestore, maintenanceRef, SAK_VALUE, startMaintenance } from '@blockframes/firebase-utils';
import * as env from '@env';
import { config } from 'dotenv';
import { resolve } from 'path';
import { loadDBVersion } from './migrations';
import { IMaintenanceDoc } from '@blockframes/model';
import { LATEST_VERSION } from './firestoreMigrations';

export async function isMigrationRequired(db: Firestore) {
  const currentVersion = await loadDBVersion(db);
  console.log('Detecting if Firestore migration is required:');
  console.log('Latest DB version:', LATEST_VERSION);
  console.log('Current DB version:', currentVersion);
  return currentVersion < LATEST_VERSION;
}

export async function displayCredentials() {
  console.log('Local Firebase config:\n\n', env.firebase());
  console.log('\n\nBackup Storage Bucket: ', env.backupBucket);
  console.log('\n\nFull env.ts module:');
  console.log({ ...env });

  console.log('\n\nContents of .env secrets:');
  console.log(config({ debug: true }));

  const GAC = SAK_VALUE();
  if (!GAC) {
    console.log('NO GAC value detected, will not display SAK');
    return;
  }
  let GACObj: { [key: string]: string };
  try {
    // If service account is a stringified json object
    GACObj = JSON.parse(GAC);
  } catch (e) {
    // If service account is a path
    // tslint:disable-next-line: no-eval
    GACObj = eval('require')(resolve(GAC));
  }
  delete GACObj.privateKey;
  delete GACObj.private_key;
  console.log('\n\nUsing default service account:\n', GACObj);
}

export async function ensureMaintenanceMode(db: FirebaseFirestore.Firestore) {
  console.log('Ensuring maintenance mode stays active in Firestore');
  await startMaintenance(db);
  const unsubscribe = maintenanceRef(db).onSnapshot(async snap => {
    const maintenance = snap.data() as IMaintenanceDoc;
    if (maintenance.endedAt || !maintenance.startedAt) {
      console.log('Maintenance mode was removed.');
      await startMaintenance(db);
      console.log('Insurance started it back.');
    }
  });
  return function () {
    unsubscribe();
    console.log('Maintenance mode insurance ended');
  }
}
