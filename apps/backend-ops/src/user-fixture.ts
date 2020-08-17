import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { updateUSERS } from './users';
import { loadAdminServices } from './admin';

const { db, auth } = loadAdminServices();

/**
 * This function reads users from Firestore and generates users fixtures file for repo
 * @param db firestore instance
 */
export async function generateFixturesFile() {
  const usersQuerySnapshot = await db.collection('users').get();
  const users = usersQuerySnapshot.docs.map((snapshot) => {
    const user = snapshot.data();
    user.id = snapshot.id;
    return user;
  });
  const fileOutput = users.map((user) => ({
    email: user.email,
    uid: user.uid,
    password: 'blockframes',
  }));

  writeFileSync(resolve(process.cwd(), 'tools/users.fixture.json'), JSON.stringify(fileOutput));
  updateUSERS(fileOutput);
  // console.log(fileOutput);
}
