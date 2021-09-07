import { Injectable } from '@angular/core';
import { CrmStore } from './crm.store';
import { AngularFireFunctions } from '@angular/fire/functions';
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
    private functions: AngularFireFunctions,
    private service: AuthService,
  ) { }

  public async loadAnalyticsData() {
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
    const f = this.functions.httpsCallable('getAnalyticsActiveUsers');
    return f({}).toPromise();
  }

  public sendPasswordResetEmail(email: string, app: App): Promise<void> {
    return this.service.resetPasswordInit(email, app);
  }
}
