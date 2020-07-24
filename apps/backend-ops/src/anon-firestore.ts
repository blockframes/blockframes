import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { updateUSERS } from './users';
import { loadAdminServices } from './admin';

const { db, auth } = loadAdminServices();

/**
 * This function will read user's from database and populate Firebase Auth.
 * @param auth firebase auth instance
 * @param db firestore instance
 */
// export async function generateUsers(auth: auth.Auth, db: firestore.Firestore) {
//   const usersRef = db.collection('users')

//     const usersQuerySnapshot = await usersRef.get()
//     const users = usersQuerySnapshot.docs.map(snapshot => {
//       const uid = snapshot.id;
//       const user = snapshot.data()
//       user.id = uid;
//       return user;
//     })
//   const userImportArray: auth.UserImportRecord[] = users.map(user => {
//     const { uid, email, firstName, lastName } = user;
//     return {
//       uid,
//       email,
//       displayName: `${firstName} ${lastName}`,
//       emailVerified: true,
//       disabled: false,
//       metadata: undefined
//     }
//   })
//     // users.
//     // ! TODO: IMPLEMENT QUEUE
//     return auth.importUsers(userImportArray)
// }

/**
 * This function reads users from Firestore and generates users fixtures file for repo
 * @param db firestore instance
 */
export async function generateFixturesFile() {
  const usersQuerySnapshot = await db.collection('users').get();
  const users = usersQuerySnapshot.docs.map(snapshot => {
    const user = snapshot.data();
    user.id = snapshot.id;
    return user;
  });
  const fileOutput = users.map(user => ({
    email: user.email,
    uid: user.uid,
    password: 'blockframes'
  }));

  writeFileSync(resolve(process.cwd(), 'tools/users.fixture.json'), JSON.stringify(fileOutput));
  updateUSERS(fileOutput);
  // console.log(fileOutput);
}
