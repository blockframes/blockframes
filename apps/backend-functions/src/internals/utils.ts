import { PublicUser } from '@blockframes/model';
import * as admin from 'firebase-admin';
export { firebaseRegion } from '@env';

/**
 * Gets the user document corresponding to a given `uid`.
 * Throws if the user does not exists.
 */
export async function getUser(userId: string): Promise<PublicUser> {
  // TODO! #8376 Do not do this - db init is a side-effect and db should be passed in or init in a diff module
  const db = admin.firestore();
  const user = await db.doc(`users/${userId}`).get();
  return user.data() as PublicUser;
}

export function getDeepValue<T>(object: unknown, path: string): T {
  if (typeof object === 'object') {
    return path.split('.').reduce((result, key) => result?.[key], object);
  }
}
