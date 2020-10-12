import { loadAdminServices, MIGRATIONS } from "@blockframes/firebase-utils";
import { join } from "path";
import { loadDBVersion } from "./migrations";
import { firebase } from '@env'

export function showHelp() {
  console.log('TODO: write a documentation');
}

export async function isMigrationRequired() {
  const { db } = loadAdminServices();
  const latestVersion = Object.keys(MIGRATIONS).length
  const currentVersion = await loadDBVersion(db);
  console.log('Detecting if Firestore migration is required:')
  console.log('Latest DB version:', latestVersion)
  console.log('Current DB version:', currentVersion)
  return currentVersion < latestVersion;
}

export function disableMaintenanceMode() {
  process.env.BLOCKFRAMES_MAINTENANCE_DISABLED = 'true';
  console.warn('Maintenance mode is disabled!')
}

export async function displayCredentials() {
  let GAP: any;
  try {
    // If service account is a stringified json object
    GAP = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  } catch (e) {
    // If service account is a path
    // tslint:disable-next-line: no-eval
    GAP = eval('require')(join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS));
  }
  delete GAP.privateKey;
  delete GAP.private_key;
  console.log('Using default service account:\n', GAP);

  console.log('Local env.ts:\n', firebase)
}
