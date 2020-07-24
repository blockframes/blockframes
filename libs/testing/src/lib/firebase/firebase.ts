import { credential, initializeApp } from 'firebase-admin';
import { initializeAdminApp, initializeTestApp } from '@firebase/testing';

/**
 * Get test (emulated) admin with specified user authentication
 * @param auth object containing uid/displayName and claims
 */
export const getEmulatedFirebase = (projectId: string, auth: any) => {
  return initializeTestApp({ auth, projectId });
};

/** Gets an emulated Firebase admin app that can circumvent security rules. Must be provided same projectId */
export const getEmulatedAdmin = (projectId: string) => {
  return initializeAdminApp({ projectId });
};

/**
 * This function will return an Admin App object that's authorised
 * and connected to a remote Firebase project's resources.
 *
 * @param projectId the Firebase project ID you want to connect to
 * @param serviceAccountKey the authorised service account key (parsed json) with
 * which to authenticate requests to this Firebase App
 */
export function getAdminApp(projectId: string, serviceAccountKey: object) {
  return initializeApp({ projectId, credential: credential.cert(serviceAccountKey) }, 'temp');
}
