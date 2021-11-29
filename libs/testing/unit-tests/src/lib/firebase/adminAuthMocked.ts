export class AdminAuthMocked {
  public users: any[] = [];

  getUserByEmail(email: string) {
    return new Promise((resolve) => {
      const user = this.users.find((u) => u.email === email);
      resolve(user);
    });
  }

  listUsers(_: number, pageToken: any) {
    return new Promise((resolve) => {
      const out = {
        users: this.users,
        pageToken,
      };
      resolve(out);
    });
  }

  deleteUsers(uids: string[]) {
    return new Promise((resolve) => {
      this.users = this.users.filter((u) => !uids.includes(u.uid));
      resolve(this.users);
    });
  }
}
