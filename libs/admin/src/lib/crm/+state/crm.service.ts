import { Injectable } from '@angular/core';
import { CrmStore } from './crm.store';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireAuth } from '@angular/fire/auth';

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
    private auth: AngularFireAuth,
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

  /**
  * Send email from Google Firebase to reset password
  * @dev This is the "hard" reset password link, sent directly from Google.
  * @param email
  */
  public sendPasswordResetEmail(email: string): Promise<void> {
    return this.auth.sendPasswordResetEmail(email);
  }
}
