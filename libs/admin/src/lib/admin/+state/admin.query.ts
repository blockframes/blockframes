import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AdminStore, AdminState } from './admin.store';

@Injectable({ providedIn: 'root' })
export class AdminQuery extends Query<AdminState> {

  constructor(protected store: AdminStore) {
    super(store);
  }

  get connectedUsers() {
    return this.getValue().analytics.connectedUsers;
  }

  getLastConnexion(uid: string): Date {
    const userInfo = this.connectedUsers.find(u => u.userId === uid);
    if (userInfo && userInfo.lastConnexion) {

      const last = userInfo.lastConnexion.toString();
      const y = last.substring(0, 4);
      const m = last.substring(5, 6);
      const d = last.substring(7, 8);

      return new Date(y, m - 1, d);
    }
  }
}
