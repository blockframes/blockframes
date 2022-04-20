import { auth } from '../testing-cypress';

export async function validateAuthUser(email: string) {
  const user = await auth.getUserByEmail(email);
  return await auth.updateUser(user.uid, { emailVerified: true });
}

export async function getAuthUserByEmail(email: string) {
  try {
    return await auth.getUserByEmail(email);
  } catch (err) {
    if (err.code === 'auth/user-not-found') return null;
    throw err;
  }
}

export async function deleteAuthUser(userId: string) {
  await auth.deleteUser(userId);
  return `User ${userId} deleted`;
}
