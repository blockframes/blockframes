export class AdminAuthMocked {
  public users: any[] = [];

  getUserByEmail(email: string) {
    const user = this.users.find(u => u.email === email);
    return Promise.resolve(user);
  }

  getUser(uid: string) {
    const user = this.users.find(u => u.uid === uid);
    return Promise.resolve(user);
  }

  listUsers(_: number, pageToken: any) {
    const out = { users: this.users, pageToken };
    return Promise.resolve(out);
  }

  deleteUsers(uids: string[]) {
    this.users = this.users.filter(u => !uids.includes(u.uid));
    return Promise.resolve(this.users);
  }
}
