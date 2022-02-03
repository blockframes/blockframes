import { auth, db } from './testing-cypress';

export function log(message: any) {
  typeof message === 'string' ? console.log(message) : console.dir(message);
  return message;
}

export async function getRandomUID() {
  const user = await getRandomUser();
  const uid = user.uid;
  console.log(uid);
  return uid;
}

export async function getRandomEmail() {
  const user = await getRandomUser();
  const email = user.email;
  console.log(email);
  return email;
}

export async function getRandomUser() {
  /**
   * Look like is not random and options should be added to be able to get a random user for festival or catalog app for example
   * and right now you will always get 1M9DUDBATqayXXaXMYThZGtE9up1 that is blockframes admin.. Not a good practice
   */
  const userQuery = await db.collection('users').limit(1).get();
  const userSnap = userQuery.docs.pop();
  const user = userSnap.data() as User;
  console.log('Got random user:\n');
  console.dir(user);
  return user;
}

export async function getUIDFromEmail(email: string) {
  const user = await auth.getUserByEmail(email);
  return user.uid;
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
