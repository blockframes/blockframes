import { Firestore } from '../admin';


/**
 * Update name and surname in user documents
 */
export async function upgrade(db: Firestore) {
  const users = await db.collection('users').get();

  const newUserData = users.docs.map(async (userDocSnapshot: any): Promise<any> => {
    const userData = userDocSnapshot.data();
    const { name, surname } = userData;

    if (userData.name && userData.surname) {
      delete userData.name;
      delete userData.surname;

      const newData = {
        ...userData,
        firstName: name,
        lastName: surname
      };
      return userDocSnapshot.ref.set(newData);
    }
  });

  await Promise.all(newUserData);
  console.log('Updating user collection done.');
}
