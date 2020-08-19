import { join } from 'path';
import { writeFileSync } from 'fs';
import { updateUSERS } from './users';
import { loadAdminServices } from './admin';
const { db } = loadAdminServices();

const dest = join(process.cwd(), 'tools', 'users.fixture.json');
/**
 * This function reads users from Firestore and generates users fixtures file for repo
 * @param db firestore instance
 */
export async function generateUserFixtures() {
  const usersQuerySnapshot = await db.collection('users').get();
  const fileOutput = usersQuerySnapshot.docs
    .map((snapshot) => ({ ...snapshot.data(), uid: snapshot.id } as any))
    .map((user) => ({ email: user.email, uid: user.uid, password: 'blockframes' }));

  writeFileSync(dest, JSON.stringify(fileOutput));
  console.log('User fixtures updated!');
  console.log('Fixtures file: ', dest);
  updateUSERS(fileOutput);
}

// export async function getUserFixtures(): USERS[] {

// }
