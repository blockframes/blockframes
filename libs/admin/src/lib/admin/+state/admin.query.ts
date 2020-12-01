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
    const userInfo = this.connectedUsers.find(u => u.uid === uid);
    if (userInfo && userInfo.lastConnexion) {
      return userInfo.lastConnexion;
    }
  }

  getFirstConnexion(uid: string): Date {
    const userInfo = this.connectedUsers.find(u => u.uid === uid);
    if (userInfo && userInfo.firstConnexion) {
      return userInfo.firstConnexion;
    }
  }
}
