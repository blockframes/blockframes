import { Injectable } from '@angular/core';
import { AdminStore } from './admin.store';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(
    protected store: AdminStore,
    private functions: AngularFireFunctions,
  ) { }

  public async loadAnalyticsData() {
    const rows = await this.getAnalyticsActiveUsers();
    this.store.update({
      analytics: {
        connectedUsers: rows.map(r => ({
          uid: r.user_id,
          firstConnexion: r.first_connexion,
          lastConnexion: r.last_connexion,
          pageView: r.page_view,
        }))
      }
    });
  }

  private getAnalyticsActiveUsers(): Promise<any[]> {
    const f = this.functions.httpsCallable('getAnalyticsActiveUsers');
    return f({}).toPromise();
  }
}
