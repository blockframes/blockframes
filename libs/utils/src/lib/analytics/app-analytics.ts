import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Injectable } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { AnalyticsEvents } from './analyticsEvents';
import { centralOrgID } from '@env';

@Injectable({ providedIn: 'root' })
export class FireAnalytics {
  constructor(public analytics: AngularFireAnalytics, private authQuery: AuthQuery) { }

  public event(name: AnalyticsEvents, params: Record<string, any>) {

    if (this.authQuery.user && this.authQuery.orgId && (
      this.authQuery.orgId === centralOrgID ||
      this.authQuery.isBlockframesAdmin
    )) {
      /**
       * @dev We do not want to log centralOrg operators nor blockframes 
       * admins actions on the platform.
       */
      return false;
    }

    try {
      this.analytics.logEvent(name, { ...params, uid: this.authQuery.userId });
    } catch {
      this.analytics.logEvent(name, { ...params });
    }
  }
}
