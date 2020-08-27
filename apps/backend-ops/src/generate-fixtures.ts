import { getCollection } from '@blockframes/firebase-utils';
import { User } from '@blockframes/user/types';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { USER_FIXTURES_PASSWORD } from './users';

export async function generateFixtures() {
  await generateUsers();
}

/**
 * This function will generate `tools/users.fixture.json` from users currently in Firestore
 */
async function generateUsers() {
  console.log('Generating user fixtures file from Firestore...');

  console.time('Fetching users from Firestore');
  const users = await getCollection<User>('users');
  console.timeEnd('Fetching users from Firestore');

  const output = users.map((user) => ({
    email: user.email,
    uid: user.uid,
    password: USER_FIXTURES_PASSWORD,
  }));
  const dest = join(process.cwd(), 'tools', 'fixtures', 'users.json');
  await fsPromises.writeFile(dest, JSON.stringify(output));
  console.log('Fixture saved:', dest);
}
