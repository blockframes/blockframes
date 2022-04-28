import { LATEST_VERSION, loadAdminServices, startMaintenance } from "@blockframes/firebase-utils";
import { resolve } from "path";
import { loadDBVersion } from "./migrations";
import { firebase } from '@env'
import { IMaintenanceDoc } from "@blockframes/model";

export function showHelp() {
  console.log('TODO: write a documentation');
}

export async function isMigrationRequired(db = loadAdminServices().db) {
  const currentVersion = await loadDBVersion(db);
  console.log('Detecting if Firestore migration is required:');
  console.log('Latest DB version:', LATEST_VERSION);
  console.log('Current DB version:', currentVersion);
  return currentVersion < LATEST_VERSION;
}

export function disableMaintenanceMode() {
  process.env.BLOCKFRAMES_MAINTENANCE_DISABLED = 'true';
  console.warn('Maintenance mode is disabled!');
}

export async function displayCredentials() {
  let GAP: { [key: string]: string };
  try {
    // If service account is a stringified json object
    GAP = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  } catch (e) {
    // If service account is a path
    // tslint:disable-next-line: no-eval
    GAP = eval('require')(resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
  }
  delete GAP.privateKey;
  delete GAP.private_key;
  console.log('Using default service account:\n', GAP);

  console.log('Local env.ts:\n', firebase());
}

export async function ensureMaintenanceMode(db: FirebaseFirestore.Firestore) {
  console.log('Ensuring maintenance mode stays active in Firestore');
  const maintenanceRef = db.collection('_META').doc('_MAINTENANCE');
  await startMaintenance(db);
  const unsubscribe = maintenanceRef.onSnapshot(async snap => {
    const maintenance = snap.data() as IMaintenanceDoc;
    if (maintenance.endedAt || !maintenance.startedAt) {
      await startMaintenance(db);
    }
  })
  return function () {
    unsubscribe();
    console.log('Maintenance mode insurance ended');
  }
}
