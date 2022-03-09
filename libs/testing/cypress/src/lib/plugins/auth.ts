import { auth } from '../testing-cypress';

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

export async function validateAuthUser(email: string) {
  const user = await auth.getUserByEmail(email)
  return await auth.updateUser(user.uid, {emailVerified: true})
}

