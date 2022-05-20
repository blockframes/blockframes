import { Injectable } from '@angular/core';
import { CrmStore } from './crm.store';
import { AuthService } from '@blockframes/auth/+state';
import { App, ErrorResultResponse } from '@blockframes/model';
import { CallableFunctions } from 'ngfire';

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
    private functions: CallableFunctions,
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

  private getAnalyticsActiveUsers(): Promise<AnalyticsActiveUser[]> {
    return this.functions.call<unknown, AnalyticsActiveUser[]>('getAnalyticsActiveUsers', {});
  }

  public sendPasswordResetEmail(email: string, app: App): Promise<ErrorResultResponse> {
    return this.service.resetPasswordInit(email, app);
  }
}
