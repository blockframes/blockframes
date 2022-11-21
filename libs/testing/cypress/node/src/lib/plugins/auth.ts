import { auth } from '../testing-cypress';
import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
import { serverId } from '@blockframes/utils/constants';
import { User } from 'firebase/auth';

export async function createUser(data: { uid: string; email: string; emailVerified: boolean; password: string }) {
  return await auth.createUser(data);
}

export async function getUser(emailOrUid: string) {
  try {
    return emailOrUid.includes('@') ? await auth.getUserByEmail(emailOrUid) : await auth.getUser(emailOrUid);
  } catch (err) {
    if (err.code === 'auth/user-not-found') return null;
    throw err.code;
  }
}

export async function deleteUser(uid: string) {
  return await auth.deleteUsers([uid]);
}

export async function updateUser(data: { uid: string; update: Partial<User> }) {
  const { uid, update } = data;
  return await auth.updateUser(uid, update);
}

export async function deleteAllTestUsers() {
  const list = await auth.listUsers();
  const users = list.users;
  const uids: string[] = [];
  for (const user of users) {
    if (!user.email || user.email.includes(`@${serverId}.mailosaur.net`)) uids.push(user.uid);
  }
  return await auth.deleteUsers(uids);
}
