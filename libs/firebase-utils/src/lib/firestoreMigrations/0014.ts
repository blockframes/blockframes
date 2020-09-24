// @ts-nocheck
import { Firestore } from '../types';


/**
 * Update name and surname in user documents
 */
export async function upgrade(db: Firestore) {
  const users = await db.collection('users').get();
  const batch = db.batch();

  users.docs.forEach(userDoc=> {
    const userData = userDoc.data();
    const { name, surname } = userData;

    if (userData.name || userData.surname) {
      delete userData.name;
      delete userData.surname;

      const newData = {
        ...userData,
        firstName: name,
        lastName: surname
      };
      return batch.set(userDoc.ref, newData);
    }
  });

  await batch.commit();
  console.log('Updating user collection done.');
}
