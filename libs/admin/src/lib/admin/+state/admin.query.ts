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
      return this.stringToDate(userInfo.lastConnexion);
    }
  }

  getFirstConnexion(uid: string): Date {
    const userInfo = this.connectedUsers.find(u => u.uid === uid);
    if (userInfo && userInfo.firstConnexion) {
      return this.stringToDate(userInfo.firstConnexion);
    }
  }

  private stringToDate(_date: Date){
    const date = _date.toString();
    const y = parseInt(date.substring(0, 4), 10);
    const m = parseInt(date.substring(5, 6), 10);
    const d = parseInt(date.substring(7, 8), 10);

    return new Date(y, m - 1, d);
  }
}
