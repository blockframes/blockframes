import { Injectable } from '@angular/core';
import { CrmStore } from './crm.store';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { AuthService } from '@blockframes/auth/service';
import { App } from '@blockframes/utils/apps';
import { ErrorResultResponse } from '@blockframes/utils/utils';

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
    protected store: CrmStore, // TODO #8280 clean
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
    const r = await f({});
    return r.data;
  }

  public sendPasswordResetEmail(email: string, app: App): Promise<ErrorResultResponse> {
    return this.service.resetPasswordInit(email, app);
  }
}
