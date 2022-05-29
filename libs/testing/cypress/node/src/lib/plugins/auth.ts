import { auth } from '../testing-cypress';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';

export async function createUser(data: { uid: string; email: string }) {
  return auth.createUser({ ...data, password: USER_FIXTURES_PASSWORD });
}

export async function getUser(emailOrUid: string) {
  try {
    if (emailOrUid.includes('@')) return await auth.getUserByEmail(emailOrUid);
    return await auth.getUser(emailOrUid);
  } catch (err) {
    if (err.code === 'auth/user-not-found') return null;
    throw err.code;
  }
}

export async function deleteAuthUser(uid: string) {
  return auth.deleteUser(uid);
}

export async function updateUser(data: { uid: string; update: Record<string, unknown> }) {
  const { uid, update } = data;
  return auth.updateUser(uid, update);
}

export async function deleteAllTestUsers() {
  const list = await auth.listUsers();
  const users = list.users;
  const uids = users.filter(user => user.email.includes('@fteeksuu.mailosaur.net')).map(user => user.uid);
  return await auth.deleteUsers(uids);
}
