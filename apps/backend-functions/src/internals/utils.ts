import * as admin from 'firebase-admin';
import { PublicUser } from '../data/types';
export { firebaseRegion } from '@env';

/**
 * Gets the user document corresponding to a given `uid`.
 * Throws if the user does not exists.
 */
export async function getUser(userId: string): Promise<PublicUser> {
  const db = admin.firestore();
  const user = await db.doc(`users/${userId}`).get();
  return user.data() as PublicUser;
}

export function getDeepValue<T>(object: unknown, path: string): T {
  if (typeof object === 'object') {
    return path.split('.').reduce((result, key) => result?.[key], object);
  }
}