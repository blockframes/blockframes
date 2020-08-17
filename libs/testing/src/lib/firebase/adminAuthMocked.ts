const authTestSet = require('../mocked-data-unit-tests/auth.json');

export class AdminAuthMocked {

  private users = authTestSet;

  getUserByEmail(email: string) {
    return new Promise((resolve) => {
      const user = this.users.find(u => u.email === email);
      resolve(user);
    });
  }

  listUsers(count: number, pageToken: any) {
    return new Promise((resolve) => {
      const out = {
        users: this.users,
        pageToken: undefined
      }
      resolve(out);
    });
  }

  deleteUser(uid: string) {
    return new Promise((resolve) => {
      resolve(true);
    });
  }
}