import { db } from '../testing-cypress';
import type { User } from '@blockframes/user/types';

export async function getRandomEmail() {
  const { email } = await getRandomUser();
  console.log(email);
  return email;
}

export async function getRandomUser() {
  // TODO #7701 Improve getRandomUser method
  const userQuery = await db.collection('users').limit(1).get();
  const userSnap = userQuery.docs.pop();
  const user = userSnap.data() as User;
  console.log('Got random user:\n');
  console.dir(user);
  return user;
}
