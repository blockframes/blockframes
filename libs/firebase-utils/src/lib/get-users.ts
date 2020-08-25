import type { firestore } from 'firebase-admin';
import { User } from '@blockframes/user/types';
import { auth } from '@blockframes/testing/firebase';

export interface TestUser extends User {
  password: string;
}
/**
 *
 * @param db firestore db from which to get users
 * @param limit the max number of users you want to fetch - defaults to 50
 */
export async function getUsers(db: firestore.Firestore, limit?: number) {
  const userQuerySnapshot = await db
    .collection('users')
    .limit(limit ?? 50)
    .get();
  return userQuerySnapshot.docs
    .map((snapshot) => snapshot.data() as TestUser)
    .map((user) => {
      user.password = auth.USER_FIXTURES_PASSWORD;
      return user;
    });
}
