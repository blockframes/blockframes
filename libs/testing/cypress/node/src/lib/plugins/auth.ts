import { auth } from '../testing-cypress';

export async function validateAuthUser(email: string) {
  const user = await auth.getUserByEmail(email);
  return await auth.updateUser(user.uid, { emailVerified: true });
}
