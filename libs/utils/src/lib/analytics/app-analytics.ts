import { AngularFireAnalytics  } from '@angular/fire/analytics';
import { Injectable } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';

@Injectable({providedIn: 'root'})
export class FireAnalytics {
  constructor(public analytics: AngularFireAnalytics, private authQuery: AuthQuery) {}

  public event(name: string, params: Record<string, any>) {
    try {
      this.analytics.logEvent(name, { ...params, uid: this.authQuery.userId });
    } catch {
      this.analytics.logEvent(name, { ...params });
    }
  }
}
