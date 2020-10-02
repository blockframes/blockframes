import { loadAdminServices, MIGRATIONS } from "@blockframes/firebase-utils";
import { loadDBVersion } from "./migrations";

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
