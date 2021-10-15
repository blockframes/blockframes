import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { CrmStore, CrmState } from './crm.store';

@Injectable({ providedIn: 'root' })
export class CrmQuery extends Query<CrmState> {

  constructor(protected store: CrmStore) {
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

  getSessionCount(uid: string): number {
    const userInfo = this.connectedUsers.find(u => u.uid === uid);
    if (userInfo && userInfo.sessionCount) {
      return userInfo.sessionCount;
    }
  }

  getPageView(uid: string): number {
    const userInfo = this.connectedUsers.find(u => u.uid === uid);
    if (userInfo && userInfo.pageView) {
      return userInfo.pageView;
    }
  }
}
