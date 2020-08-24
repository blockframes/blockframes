import type { firestore } from 'firebase-admin';
import { User } from '@blockframes/user/types';

export async function getUsers(db: firestore.Firestore) {
  const userQuerySnapshot = await db.collection('users').get();
  return userQuerySnapshot.docs.map((snapshot) => snapshot.data() as User);
}
