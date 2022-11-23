import { USER_FIXTURES_PASSWORD } from '@blockframes/devops';
import { User } from 'firebase/auth';

export const adminAuth = {
  createUser(data: { uid: string; email: string; emailVerified: boolean; password?: string }) {
    return cy.task('createUser', { password: USER_FIXTURES_PASSWORD, ...data });
  },

  getUser(emailOrUid: string) {
    return cy.task('getUser', emailOrUid);
  },

  deleteUser(uid: string) {
    return cy.task('deleteUser', uid);
  },

  updateUser(data: { uid: string; update: Partial<User> }) {
    return cy.task('updateUser', data);
  },

  deleteAllTestUsers() {
    return cy.task('deleteAllTestUsers');
  },
};
