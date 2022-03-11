import { Injectable } from '@angular/core';
import { CrmStore } from './crm.store';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';
import { AuthService } from '@blockframes/auth/+state';
import { App } from '@blockframes/utils/apps';

interface AnalyticsActiveUser {
  user_id: string,
  first_connexion: {
    value: Date
  },
  last_connexion: {
    value: Date
  },
  session_count: number,
  page_view: number
}

@Injectable({ providedIn: 'root' })
export class CrmService {
  constructor(
    protected store: CrmStore,
    private functions: Functions,
    private service: AuthService,
  ) { }

  public async loadAnalyticsData() {
    if (this.store.getValue().analytics.connectedUsers?.length) return;
    const rows = await this.getAnalyticsActiveUsers();
    this.store.update({
      analytics: {
        connectedUsers: rows.map(r => ({
          uid: r.user_id,
          firstConnexion: r.first_connexion.value,
          lastConnexion: r.last_connexion.value,
          sessionCount: r.session_count,
          pageView: r.page_view,
        }))
      }
    });
  }

  private async getAnalyticsActiveUsers(): Promise<AnalyticsActiveUser[]> {
    const f = httpsCallable<unknown, AnalyticsActiveUser[]>(this.functions, 'getAnalyticsActiveUsers');
    return (await f({})).data;
  }

  public sendPasswordResetEmail(email: string, app: App): Promise<HttpsCallableResult<unknown>> {
    return this.service.resetPasswordInit(email, app);
  }
}
