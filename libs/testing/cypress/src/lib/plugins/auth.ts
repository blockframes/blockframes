import { auth, db } from '../testing-cypress';
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

export async function createUserToken(uid: string) {
  /**
   * This is what is missing in token to be able to pass the rules
   * but this does not work..
   * @see isSignedIn() in firestore.rules
   **/
  const tokenPayLoad = {
    firebase: {
      sign_in_provider: 'password',
      identities: {},
    },
  };
  return await auth.createCustomToken(uid, tokenPayLoad);
}
