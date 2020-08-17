import { resolve } from 'path';
import { readFileSync } from 'fs';
import { initializeAdminApp, initializeTestApp, loadFirestoreRules } from '@firebase/testing';

/** Gets an emulated Firestore db object that can circumvent security rules. Must be provided same projectId */
export function getEmulatedAdminFirestore({ projectId, databaseName }) {
  return initializeAdminApp({ projectId, databaseName }).firestore();
}

/**
 * Load and enable Firestore rules file found in firebase.json into emulator
 * @param projectId a string of project Id
 */
export function enableFirestoreRulesFor(projectId: string) {
  const firebaseConfig = require(resolve(process.cwd(), './firebase.json'));
  const rulesPath = resolve(process.cwd(), firebaseConfig.firestore.rules);
  const rules = readFileSync(rulesPath, 'utf8');
  return loadFirestoreRules({ projectId, rules });
}

/**
 * Get test (emulated) Firestore with specified user authentication
 * @param auth the object to use for authentication (typically {uid: some-uid}) - assuming this is the custom claim
 */
export const getEmulatedFirestore = ({ auth, projectId, databaseName }) => {
  return initializeTestApp({ auth, projectId, databaseName }).firestore();
};
