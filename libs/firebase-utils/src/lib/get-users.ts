import type { firestore } from 'firebase-admin';
import { User } from '@blockframes/user/types';
import { auth } from '@blockframes/testing/firebase';

interface TestUser extends User {
  password: string;
}
/**
 *
 * @param db firestore db from which to get users
 */
export async function getUsers(db: firestore.Firestore) {
  const userQuerySnapshot = await db.collection('users').get();
  return userQuerySnapshot.docs
    .map((snapshot) => snapshot.data() as TestUser)
    .map((user) => {
      user.password = auth.USER_FIXTURES_PASSWORD;
      return user;
    });
}
