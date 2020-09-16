import { loadAdminServices, MIGRATIONS } from "@blockframes/firebase-utils";
import { loadDBVersion } from "./migrations";

export function showHelp() {
  console.log('TODO: write a documentation');
}

export async function isMaintenanceRequired() {
  const { db } = loadAdminServices();
  const currentVersion = Object.keys(MIGRATIONS).length
  const localVersion = await loadDBVersion(db);
  console.log('Detecting if maintenance is required:')
  console.log('Latest DB version:', currentVersion)
  console.log('Current DB version:', localVersion)
  process.exit(localVersion < currentVersion ? 0 : 1)
}
