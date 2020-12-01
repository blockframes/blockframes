import { Injectable } from '@angular/core';
import { AdminStore } from './admin.store';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(
    protected store: AdminStore,
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
          pageView: r.page_view,
        }))
      }
    });
  }

  private getAnalyticsActiveUsers(): Promise<any[]> {
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
